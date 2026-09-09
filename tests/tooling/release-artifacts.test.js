'use strict';

const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const { describe, it } = require('node:test');

const { extractExecutable } = require('../../npm/zeroshot/lib/release-artifacts');

const EXECUTABLE_NAME = 'zeroshot';

function writeOctal(buffer, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, '0') + '\0';
  buffer.write(encoded, offset, length, 'ascii');
}

function tarHeaderChecksum(header) {
  let sum = 0;
  for (const byte of header) sum += byte;
  return sum;
}

function buildTarEntry({ name, contents, typeflag, mode = 0o755 }) {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100, 'utf8');
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, contents.length);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = typeflag.charCodeAt(0);
  header.write('ustar\0', 257, 6, 'ascii');
  header.write('00', 263, 2, 'ascii');
  writeOctal(header, 148, 8, tarHeaderChecksum(header));
  const padding = Buffer.alloc((512 - (contents.length % 512)) % 512);
  return Buffer.concat([header, contents, padding]);
}

function buildArchive(entries) {
  const tar = Buffer.concat([...entries, Buffer.alloc(1024)]);
  return zlib.gzipSync(tar, { level: 9, mtime: 0 });
}

describe('release archive executable entry validation', () => {
  it('extracts a POSIX regular-file entry (typeflag "0")', () => {
    const contents = Buffer.from('zeroshot-posix-binary');
    const archive = buildArchive([
      buildTarEntry({ name: EXECUTABLE_NAME, contents, typeflag: '0' }),
    ]);
    assert.deepEqual(extractExecutable(archive, EXECUTABLE_NAME), contents);
  });

  it('extracts a legacy regular-file entry (NUL typeflag)', () => {
    const contents = Buffer.from('zeroshot-legacy-binary');
    const archive = buildArchive([
      buildTarEntry({ name: EXECUTABLE_NAME, contents, typeflag: '\0' }),
    ]);
    assert.deepEqual(extractExecutable(archive, EXECUTABLE_NAME), contents);
  });

  for (const [label, typeflag] of [
    ['symbolic link', '2'],
    ['hard link', '1'],
    ['directory', '5'],
    ['character device', '3'],
  ]) {
    it(`rejects a ${label} entry using the expected executable name`, () => {
      const archive = buildArchive([
        buildTarEntry({ name: EXECUTABLE_NAME, contents: Buffer.alloc(0), typeflag }),
      ]);
      assert.throws(
        () => extractExecutable(archive, EXECUTABLE_NAME),
        /ARCHIVE_INVALID: zeroshot is not a regular file/
      );
    });
  }
});
