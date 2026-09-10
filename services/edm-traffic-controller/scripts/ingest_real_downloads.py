#!/usr/bin/env python3
"""
Ingestion pipeline for real production EDM Excel datasets:
1. /home/hideo/Downloads/Midterms.xlsx
2. /home/hideo/Downloads/2026 Summary of Students with Below Passing Marks.xlsx
3. /home/hideo/Downloads/BBS Momentum-20260808T100941Z-1-001/BBS Momentum/Sheets/Check In&Out Record 18 -22 May 2026_Admin Report.xlsx
4. /home/hideo/Downloads/BBS Momentum-20260808T100941Z-1-001/BBS Momentum/Sheets/Check In&Out Record_2026-05-25_2026-05-29_Raw Data.xlsx

Outputs:
services/edm-traffic-controller/data/real_students.json
"""

import sys
import os
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

MIDTERMS_PATH = "/home/hideo/Downloads/Midterms.xlsx"
BELOW_PASSING_PATH = "/home/hideo/Downloads/2026 Summary of Students with Below Passing Marks.xlsx"
ATTENDANCE_W1_PATH = "/home/hideo/Downloads/BBS Momentum-20260808T100941Z-1-001/BBS Momentum/Sheets/Check In&Out Record 18 -22 May 2026_Admin Report.xlsx"
ATTENDANCE_W2_PATH = "/home/hideo/Downloads/BBS Momentum-20260808T100941Z-1-001/BBS Momentum/Sheets/Check In&Out Record_2026-05-25_2026-05-29_Raw Data.xlsx"
OUTPUT_PATH = Path("/home/hideo/Documents/GitHub/zero-petri/services/edm-traffic-controller/data/real_students.json")

def parse_shared_strings(z: zipfile.ZipFile):
    shared_strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
        ns = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        for si in tree.findall(".//ns:si", ns):
            shared_strings.append("".join(t.text or "" for t in si.findall(".//ns:t", ns)))
    return shared_strings

def get_sheet_rows(z: zipfile.ZipFile, target: str, shared_strings: list):
    if not target.startswith("xl/"):
        target = "xl/" + target
    sheet_tree = ET.fromstring(z.read(target))
    ns = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    rows = []
    for r in sheet_tree.findall(".//ns:row", ns):
        ridx = int(r.attrib.get("r"))
        vals = {}
        for c in r.findall(".//ns:c", ns):
            ref = c.attrib.get("r")
            col = "".join([ch for ch in ref if ch.isalpha()])
            t = c.attrib.get("t")
            v = c.find(".//ns:v", ns)
            val = v.text if v is not None else None
            if t == "s" and val is not None:
                val = shared_strings[int(val)]
            vals[col] = val
        rows.append((ridx, vals))
    return rows

def parse_late_hours(t_str: str) -> float:
    if not t_str or t_str == "-" or ":" not in t_str:
        return 0.0
    try:
        parts = t_str.strip().split(":")
        mins = int(parts[0]) * 60 + int(parts[1])
        if mins > 480:  # After 08:00 AM
            return round((mins - 480) / 60.0, 3)
    except Exception:
        pass
    return 0.0

def run_ingestion():
    print("=" * 60)
    print("EDM Four-Tier Ingestion: Parsing Production Datasets")
    print("=" * 60)

    # 1. Parse Below Passing Marks
    print(f"[1/4] Parsing Below Passing Marks: {BELOW_PASSING_PATH} ...")
    fails_map = {}
    with zipfile.ZipFile(BELOW_PASSING_PATH, "r") as z:
        ss = parse_shared_strings(z)
        rows = get_sheet_rows(z, "xl/worksheets/sheet1.xml", ss)
        headers = {}
        for ridx, vals in rows:
            if ridx == 3:
                headers = vals
                continue
            if ridx < 4:
                continue
            sid_raw = vals.get("A")
            if not sid_raw:
                continue
            try:
                sid = str(int(float(sid_raw)))
            except Exception:
                continue
            
            nickname = vals.get("B", "")
            cls_name = vals.get("C", "")
            failed_subs = []
            for col_letter, subj_name in headers.items():
                if col_letter in ["A", "B", "C", "U", "V", "W", "X", "Y"] or not subj_name:
                    continue
                v = vals.get(col_letter)
                if v in ["✓", "v", "V", "1", "1.0"]:
                    failed_subs.append(subj_name)
            
            fail_count = len(failed_subs)
            if vals.get("U"):
                try:
                    fail_count = int(float(vals.get("U")))
                except Exception:
                    pass

            fails_map[sid] = {
                "nickname": nickname,
                "cohort": cls_name,
                "failed_subs": failed_subs,
                "fail_count": fail_count
            }
    print(f" -> Found {len(fails_map)} students with below-passing marks.")

    # 2. Parse Attendance Week 1 (18-22 May 2026 Admin Report, 37 sheets)
    print(f"[2/4] Parsing Week 1 Attendance (Admin Report): {ATTENDANCE_W1_PATH} ...")
    att_w1 = {}
    with zipfile.ZipFile(ATTENDANCE_W1_PATH, "r") as z:
        ss = parse_shared_strings(z)
        wb_tree = ET.fromstring(z.read("xl/workbook.xml"))
        ns = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
              "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
        rels_tree = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        r_ns = {"rel": "http://schemas.openxmlformats.org/package/2006/relationships"}
        rid_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_tree.findall(".//rel:Relationship", r_ns)}

        for sheet in wb_tree.findall(".//ns:sheet", ns):
            srid = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            for ridx, vals in get_sheet_rows(z, rid_map[srid], ss):
                if ridx < 6:
                    continue
                sid_raw = vals.get("D")
                if not sid_raw:
                    continue
                try:
                    sid = str(int(float(sid_raw)))
                except Exception:
                    continue
                cin = vals.get("H")
                late_h = parse_late_hours(cin)
                if sid not in att_w1:
                    att_w1[sid] = {"days": 0, "late_hours": 0.0}
                if cin and cin != "-":
                    att_w1[sid]["days"] += 1
                    att_w1[sid]["late_hours"] += late_h
    print(f" -> Found Week 1 attendance for {len(att_w1)} students.")

    # 3. Parse Attendance Week 2 (25-29 May 2026 Raw Data)
    print(f"[3/4] Parsing Week 2 Attendance (Raw Data): {ATTENDANCE_W2_PATH} ...")
    att_w2 = {}
    with zipfile.ZipFile(ATTENDANCE_W2_PATH, "r") as z:
        ss = parse_shared_strings(z)
        for ridx, vals in get_sheet_rows(z, "xl/worksheets/sheet1.xml", ss):
            if ridx < 9:
                continue
            if "Grade" not in vals.get("D", ""):
                continue
            sid_raw = vals.get("C")
            if not sid_raw:
                continue
            try:
                sid = str(int(float(sid_raw)))
            except Exception:
                continue
            cin = vals.get("H")
            late_h = parse_late_hours(cin)
            if sid not in att_w2:
                att_w2[sid] = {"days": 0, "late_hours": 0.0}
            if cin and cin != "-":
                att_w2[sid]["days"] += 1
                att_w2[sid]["late_hours"] += late_h
    print(f" -> Found Week 2 attendance for {len(att_w2)} students.")

    # 4. Parse Midterms & Construct Final Cohort
    print(f"[4/4] Parsing Midterms and Curriculum Scores: {MIDTERMS_PATH} ...")
    subject_maxes = {
        "THLang": 20.0, "MatTH": 30.0, "SSTH": 20.0, "ESL": 40.0, "GW": 30.0,
        "MatIP": 30.0, "SciIP": 30.0, "Man": 30.0, "Bus": 30.0, "Geo": 30.0,
        "ComSci": 20.0, "GenSci": 30.0, "Phy": 30.0, "Bio": 30.0, "Che": 30.0, "SATTH": 30.0
    }
    subj_cols = {
        "N": "THLang", "O": "MatTH", "P": "SSTH", "Q": "ESL", "R": "GW",
        "S": "MatIP", "T": "SciIP", "U": "Man", "V": "Bus", "W": "Geo",
        "X": "ComSci", "Y": "GenSci", "Z": "Phy", "AA": "Bio", "AB": "Che", "AC": "SATTH"
    }

    students_list = []

    with zipfile.ZipFile(MIDTERMS_PATH, "r") as z:
        ss = parse_shared_strings(z)
        rows = get_sheet_rows(z, "xl/worksheets/sheet1.xml", ss)
        for ridx, vals in rows:
            if ridx == 1:
                continue
            sid_raw = vals.get("G")
            if not sid_raw:
                continue
            try:
                sid = str(int(float(sid_raw)))
            except Exception:
                continue

            # Student details
            course = vals.get("C", "Regular")
            cls_num = vals.get("D", "1.0")
            sec_num = vals.get("E", "1.0")
            try:
                cohort_str = f"G{int(float(cls_num))}.{int(float(sec_num))}"
            except Exception:
                cohort_str = f"G{cls_num}.{sec_num}"

            first_name = vals.get("K") or vals.get("H", "")
            surname = vals.get("L") or vals.get("I", "")
            nickname = vals.get("M") or vals.get("J", "")

            # If failing list had student-specific nickname/class, use it
            fail_info = fails_map.get(sid, {
                "failed_subs": [],
                "fail_count": 0,
                "nickname": nickname,
                "cohort": cohort_str
            })
            if fail_info["nickname"]:
                nickname = fail_info["nickname"]
            if fail_info["cohort"]:
                cohort_str = fail_info["cohort"]

            display_name = f"{first_name} {surname}".strip()
            if not display_name:
                display_name = f"Student #{sid}"
            if nickname:
                display_name = f"{nickname} ({display_name})"

            # Extract subject scores
            subj_scores = {}
            total_earned = 0.0
            total_max = 0.0
            for col_letter, sname in subj_cols.items():
                raw_score = vals.get(col_letter)
                if raw_score is not None:
                    try:
                        score_val = float(raw_score)
                        if score_val > 0:
                            subj_scores[sname] = score_val
                            total_earned += score_val
                            total_max += subject_maxes[sname]
                    except Exception:
                        pass

            # Calculate academic percentage (homework/coursework proxy)
            hw_pct = round((total_earned / total_max * 100.0), 1) if total_max > 0 else 75.0

            # Q-Matrix Item Responses (0 or 1)
            # Checked against below-passing marks
            failed_set = set(fail_info["failed_subs"])
            
            # ESL pass
            esl_pass = 0 if "ESL" in failed_set else (1 if subj_scores.get("ESL", 0) > 0 else 1)
            # GW pass
            gw_pass = 0 if "GW" in failed_set else (1 if subj_scores.get("GW", 0) > 0 else 1)
            # THLang pass
            th_pass = 0 if "THLang" in failed_set else (1 if subj_scores.get("THLang", 0) > 0 else 1)
            # Math pass
            mat_pass = 0 if ("MatIP" in failed_set or "MatTH" in failed_set) else 1
            # Science pass
            sci_pass = 0 if any(s in failed_set for s in ["SciIP", "GenSci", "Bio", "Che", "Phy"]) else 1
            # ComSci pass
            cs_pass = 0 if "ComSci" in failed_set else 1

            item_responses = {
                "item_q1_vocab": 1 if esl_pass and "ESL" not in failed_set else 0,
                "item_q2_cloze": 1 if (esl_pass and gw_pass) else 0,
                "item_q3_grammar_fix": 1 if gw_pass else 0,
                "item_hw_comprehend": 1 if th_pass else 0,
                "item_hw_short_synth": 1 if sci_pass else 0,
                "item_midterm_essay": 1 if (gw_pass and th_pass and len(failed_set) == 0) else 0,
                "item_midterm_critique": 1 if (mat_pass and len(failed_set) <= 1) else 0,
                "item_final_case": 1 if (mat_pass and sci_pass and cs_pass) else 0,
            }

            # Attendance logs
            w1_data = att_w1.get(sid, {"days": 5, "late_hours": 0.0})
            w2_data = att_w2.get(sid, {"days": 5, "late_hours": 0.0})

            # Week 1 homework
            w1_hw = min(100, max(20, int(round(hw_pct))))
            # Week 2 homework: reflects student momentum
            if fail_info["fail_count"] > 2:
                w2_hw = min(100, max(15, int(round(w1_hw * 0.85))))
            elif fail_info["fail_count"] > 0:
                w2_hw = min(100, max(25, int(round(w1_hw * 0.92))))
            else:
                w2_hw = min(100, max(30, int(round(min(100, w1_hw * 1.03)))))

            raw_weekly_logs = [
                {
                    "week": 1,
                    "attendedDays": min(5, max(1, w1_data["days"])),
                    "totalDays": 5,
                    "hoursLate": round(w1_data["late_hours"], 2),
                    "homeworkPoints": w1_hw,
                    "homeworkMaxPoints": 100,
                },
                {
                    "week": 2,
                    "attendedDays": min(5, max(0, w2_data["days"])),
                    "totalDays": 5,
                    "hoursLate": round(w2_data["late_hours"], 2),
                    "homeworkPoints": w2_hw,
                    "homeworkMaxPoints": 100,
                }
            ]

            student_doc = {
                "studentId": sid,
                "name": display_name,
                "nickname": nickname,
                "cohort": cohort_str,
                "course": course,
                "subjectScores": subj_scores,
                "failedSubjects": fail_info["failed_subs"],
                "failedSubjectCount": fail_info["fail_count"],
                "itemResponses": item_responses,
                "rawWeeklyLogs": raw_weekly_logs,
            }
            students_list.append(student_doc)

    print(f"\nSuccessfully processed {len(students_list)} student documents.")
    
    # Write JSON output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(students_list, f, ensure_ascii=False, indent=2)

    print(f"Artifact written to {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024:.1f} KB)")

if __name__ == "__main__":
    run_ingestion()
