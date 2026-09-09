import React, { useState } from 'react';
import {
  Gamepad2,
  QrCode,
  Radio,
} from 'lucide-react';
import { Workspace, UserProfile, GameWorkspace, MultiplayerLobby, GameQuestion, LightyearConfig } from '../types';
import { GameWorkspaceSelector } from './zero/GameWorkspaceSelector';
import { ConversationalGameDesigner } from './zero/ConversationalGameDesigner';
import { AvianPhysicsCanvas } from './zero/AvianPhysicsCanvas';
import { StumbleBlobsCanvas } from './zero/StumbleBlobsCanvas';
import { JumpyFishCanvas } from './zero/JumpyFishCanvas';
import { BevyCodeInspector } from './zero/BevyCodeInspector';
import { LightyearNetPanel } from './zero/LightyearNetPanel';
import { PublishedGamesCatalog } from './zero/PublishedGamesCatalog';
import { MultiplayerLobbyModal } from './zero/MultiplayerLobbyModal';
import { EditGameModal } from './zero/EditGameModal';
import { ActiveGameTheater } from './zero/ActiveGameTheater';

interface ZeroViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
}

export const ZeroView: React.FC<ZeroViewProps> = ({
  activeWorkspace,
  activeUser,
}) => {
  // Sub-navigation: 'studio' | 'published'
  const [activeSubTab, setActiveSubTab] = useState<'studio' | 'published'>('studio');

  // Studio layout toggle: 'preview' (Physics canvas) | 'code' (Bevy Rust inspector) | 'netcode' (Lightyear rollback panel)
  const [studioRightPane, setStudioRightPane] = useState<'preview' | 'code' | 'netcode'>('preview');
  const [showGhostEntity, setShowGhostEntity] = useState<boolean>(true);

  // Active Lobby Modal state
  const [activeLobby, setActiveLobby] = useState<MultiplayerLobby | null>(null);
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);

  // Active interactive play session (fullscreen / dedicated theater match)
  const [activePlaySession, setActivePlaySession] = useState<{
    gameId: string;
    lobby?: MultiplayerLobby | null;
  } | null>(null);

  // Edit Game Workspace modal state
  const [editingGame, setEditingGame] = useState<GameWorkspace | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Initial Game Workspaces with distinct Avian physics settings and Bevy systems
  const [gameWorkspaces, setGameWorkspaces] = useState<GameWorkspace[]>([
    {
      id: 'stumble-blobs-3d',
      title: 'Stumble Blobs 3D',
      tagline: 'Stumble Guys party knockout clone with squishy lumpy 3D blobs, rotating sweepers, and bouncy Avian3D hazards',
      dimension: '3d',
      bevyVersion: '0.15',
      avianVersion: '0.2',
      status: 'published',
      playCount: 428,
      likes: 119,
      thumbnailColor: '#0ABAB5',
      physicsConfig: {
        gravity: 22.0,
        restitution: 0.65,
        friction: 0.20,
        linearDamping: 0.05,
        substeps: 12,
      },
      gameLoop: {
        modeName: 'Knockout Obstacle Dash',
        cameraPerspective: '3d_arena',
        primaryInput: 'WASD Locomotion + Space Jump & E Dive',
        objective: 'Navigate rotating sweepers, swinging hammers, and bouncy trampolines to qualify in top 8',
        scoringRule: 'First 8 blobs crossing finish line qualify for next round',
        failCondition: 'Falling into the void or timer expires',
      },
      lightyearConfig: {
        transport: 'webtransport',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 24,
        enableAvianRollback: true,
        interestManagement: true,
      },
      bevyCode: `//! Bevy 0.15 + Avian3d 0.2 Stumble Blobs
use bevy::prelude::*;
use avian3d::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, PhysicsPlugins::default()))
        .insert_resource(Gravity(Vec3::NEG_Y * 22.0))
        .add_systems(Startup, (setup_obstacle_course, spawn_player_blob))
        .add_systems(Update, (blob_movement_system, blob_dive_system, rotate_sweepers, finish_line_sensor))
        .run();
}

#[derive(Component)]
struct LumpyBlob {
    is_grounded: bool,
    dive_impulse: f32,
}

#[derive(Component)]
struct SweeperArm;

fn setup_obstacle_course(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.spawn((
        Camera3d::default(),
        Transform::from_xyz(0.0, 14.0, 26.0).looking_at(Vec3::ZERO, Vec3::Y),
    ));

    // Platform Track Sections (Static Avian Colliders)
    commands.spawn((
        Mesh3d(meshes.add(Cuboid::new(12.0, 1.2, 10.0))),
        MeshMaterial3d(materials.add(Color::srgb(0.9, 0.9, 0.9))),
        Transform::from_xyz(0.0, 0.0, 15.0),
        RigidBody::Static,
        Collider::cuboid(12.0, 1.2, 10.0),
    ));

    // Sweeper Arm Obstacle (Kinematic with Angular Velocity)
    commands.spawn((
        SweeperArm,
        Mesh3d(meshes.add(Cylinder::new(0.45, 8.5))),
        MeshMaterial3d(materials.add(Color::srgb(1.0, 0.37, 0.12))),
        Transform::from_xyz(0.0, 1.5, 0.0),
        RigidBody::Kinematic,
        Collider::cylinder(0.45, 8.5),
        AngularVelocity(Vec3::Y * 2.6),
    ));
}

fn spawn_player_blob(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // Spawn Lumpy 3D Blob with Capsule Collider & Restitution
    commands.spawn((
        LumpyBlob {
            is_grounded: true,
            dive_impulse: 16.0,
        },
        Mesh3d(meshes.add(Sphere::new(1.1))),
        MeshMaterial3d(materials.add(Color::srgb(0.04, 0.73, 0.71))),
        Transform::from_xyz(0.0, 2.0, 16.0),
        RigidBody::Dynamic,
        Collider::capsule(0.8, 0.5),
        Restitution::new(0.65),
        Friction::new(0.2),
        LockedAxes::ROTATION_LOCKED_X | LockedAxes::ROTATION_LOCKED_Z,
    ));
}

fn blob_movement_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(&mut LinearVelocity, &Transform), With<LumpyBlob>>,
) {
    for (mut velocity, transform) in &mut query {
        let mut dir = Vec3::ZERO;
        if keyboard.pressed(KeyCode::KeyW) { dir.z -= 1.0; }
        if keyboard.pressed(KeyCode::KeyS) { dir.z += 1.0; }
        if keyboard.pressed(KeyCode::KeyA) { dir.x -= 1.0; }
        if keyboard.pressed(KeyCode::KeyD) { dir.x += 1.0; }

        if dir != Vec3::ZERO {
            let move_force = dir.normalize() * 14.0;
            velocity.x = move_force.x;
            velocity.z = move_force.z;
        }
    }
}

fn blob_dive_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(&mut LinearVelocity, &Transform, &mut LumpyBlob)>,
) {
    for (mut velocity, transform, mut blob) in &mut query {
        if keyboard.just_pressed(KeyCode::KeyE) {
            let forward = transform.forward();
            velocity.0 += forward * blob.dive_impulse + Vec3::Y * 4.0;
        }
    }
}

fn rotate_sweepers(mut query: Query<&mut AngularVelocity, With<SweeperArm>>) {
    for mut ang in &mut query {
        ang.0 = Vec3::Y * 2.6;
    }
}

fn finish_line_sensor(
    mut collision_events: EventReader<CollisionStarted>,
) {
    for CollisionStarted(_e1, _e2) in collision_events.read() {
        // Qualify blob observer logic
    }
}`,
      chatHistory: [
        {
          id: 'm-stumble-1',
          sender: 'designer',
          text: 'Welcome to Stumble Blobs 3D! I am your Bevy MCP Game Architect. Let us design a Stumble Guys party knockout clone with squishy lumpy 3D blobs and Avian3D physics hazards.',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'm-stumble-2',
          sender: 'designer',
          text: 'Configured a 3D obstacle dash: starting pad, rotating sweeper turntable, high-restitution bouncy trampolines, and a finish arch. Blobs feature wobbly vertex lumpiness, WASD locomotion, spacebar jump, and an iconic belly dive impulse (E / Shift)!',
          timestamp: Date.now() - 3000000,
          bevyUpdate: 'Setup avian3d RigidBody::Dynamic capsule collider, rotating sweepers, and belly dive impulse system',
        },
      ],
      pendingQuestion: {
        id: 'q-blob-lumpiness',
        category: 'physics',
        title: 'Step 1: Blob Lumpiness & Jelly Deform',
        description: 'How squishy and wobbly should the 3D blobs be when stumbling and diving?',
        options: [
          {
            id: 'opt-classic-stumble',
            label: 'Classic Stumble Jelly (Harmonic wobble + 0.65 Restitution)',
            description: 'Balanced squishy wobble, responsive dive impulse, and quick recovery.',
            physicsSnippet: 'Restitution::new(0.65) & vertex harmonic deform amplitude 0.12',
          },
          {
            id: 'opt-ultra-gummy',
            label: 'Ultra Gummy Pudding (High wobble + 0.85 Restitution)',
            description: 'Ultra bouncy, chaotic collisions where blobs ping across the arena.',
            physicsSnippet: 'Restitution::new(0.85) & high amplitude harmonic squish',
          },
          {
            id: 'opt-chunky-bean',
            label: 'Chunky Bean (Firm capsule + Subtle impact squash)',
            description: 'Firm and controlled competitive party runner feel.',
            physicsSnippet: 'Restitution::new(0.40) & rigid capsule collider',
          },
        ],
      },
    },
    {
      id: 'jumpy',
      title: 'Jumpy Dudes: Tactical Arena',
      tagline: 'Tactical 2D Bevy & Rapier2D platform brawler featuring the Dudes with unique character abilities, weapon pickups, and linear recoil physics',
      dimension: '2d',
      bevyVersion: '0.15',
      avianVersion: '0.2 / Rapier2d 0.19',
      status: 'published',
      playCount: 1120,
      likes: 384,
      thumbnailColor: '#FF5F1F',
      physicsConfig: {
        gravity: 19.6,
        restitution: 0.20,
        friction: 0.85,
        linearDamping: 0.15,
        substeps: 8,
      },
      gameLoop: {
        modeName: 'Dudes Tactical Arena Deathmatch',
        cameraPerspective: '2d_sidescroll',
        primaryInput: 'A/D Move + Space Jump + Q Character Ability + J Fire (Recoil) + K Pick/Throw',
        objective: 'Unleash your Dude signature ability (Jetpack, Blink, Dragon Breath, Forcefield, Freeze) and outmaneuver opponents in tactical platform combat',
        scoringRule: 'First Dude to 5 knockouts wins the match',
        failCondition: 'Depleting 3 stock lives or falling off stage',
      },
      lightyearConfig: {
        transport: 'webtransport',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 18,
        enableAvianRollback: true,
        interestManagement: true,
      },
      bevyCode: `//! Bevy 0.15 + Rapier2D / Avian2d Tactical Dudes Arena with Unique Abilities
use bevy::prelude::*;
use avian2d::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, PhysicsPlugins::default()))
        .insert_resource(Gravity(Vec2::NEG_Y * 19.6))
        .add_systems(Startup, (setup_arena_platforms, spawn_dude_fighters, spawn_weapon_crates))
        .add_systems(
            Update,
            (
                dude_movement_system,
                dude_ability_system,
                dude_weapon_fire_system,
                recoil_physics_system,
                projectile_ballistics_system,
                deathmatch_scoring_system,
            ),
        )
        .run();
}

#[derive(Component, Clone, Copy, PartialEq, Eq)]
enum DudeKind {
    Astronaut,    // Zero-G Thruster jetpack boost & low gravity glide
    Alien,        // Plasma Disintegrator bouncy piercing orb
    Wizard,       // Arcane Blink teleport dash & mana shockwave
    Dragon,       // Dragon's Breath sweeping flame cone
    MegaBot,      // EMP Forcefield deflecting bullets
    Swashbuckler, // Shadow Blade Dash with invincibility frames & triple jump
    IceElemental, // Glacial Nova freezing nearby opponents in ice
    Vampire,      // Bat Swarm Drain stealing health from enemies
    TRex,         // Primal Roar seismic blast
    Ghost,        // Ethereal Phase passing through walls and bullets
    Blobfish,     // Goo Splashdown bouncy ground slam
    Cat,          // Claw Frenzy multi-slash critical leap
}

#[derive(Component)]
struct DudeActor {
    kind: DudeKind,
    health: f32,
    max_health: f32,
    stocks: u8,
    facing_dir: f32,
    is_grounded: bool,
    jump_count: u8,
    ability_cooldown: Timer,
    ability_active: Timer,
    equipped_weapon: Option<WeaponKind>,
}

#[derive(Component, Clone, Copy, PartialEq, Eq)]
enum WeaponKind {
    BubbleBlaster,
    FishBazooka,
    LaserPike,
}

#[derive(Component)]
struct WeaponCrate {
    kind: WeaponKind,
    respawn_timer: Timer,
}

#[derive(Component)]
struct Projectile {
    damage: f32,
    lifetime: Timer,
    owner: Entity,
    is_plasma: bool,
}

fn setup_arena_platforms(mut commands: Commands) {
    commands.spawn((Camera2d::default(),));

    // Ground Platform
    commands.spawn((
        Sprite::from_color(Color::srgb(0.2, 0.25, 0.33), Vec2::new(680.0, 32.0)),
        Transform::from_xyz(0.0, -180.0, 0.0),
        RigidBody::Static,
        Collider::rectangle(680.0, 32.0),
        Friction::new(0.85),
    ));

    // Floating Tactical Ledges
    for x in [-200.0, 200.0] {
        commands.spawn((
            Sprite::from_color(Color::srgb(0.95, 0.95, 0.95), Vec2::new(180.0, 14.0)),
            Transform::from_xyz(x, -60.0, 0.0),
            RigidBody::Static,
            Collider::rectangle(180.0, 14.0),
        ));
    }
}

fn spawn_dude_fighters(mut commands: Commands) {
    // Player Astronaut Dude
    commands.spawn((
        DudeActor {
            kind: DudeKind::Astronaut,
            health: 100.0,
            max_health: 100.0,
            stocks: 3,
            facing_dir: 1.0,
            is_grounded: true,
            jump_count: 0,
            ability_cooldown: Timer::from_seconds(5.0, TimerMode::Once),
            ability_active: Timer::from_seconds(3.0, TimerMode::Once),
            equipped_weapon: Some(WeaponKind::BubbleBlaster),
        },
        Sprite::from_color(Color::srgb(0.0, 0.75, 0.95), Vec2::new(36.0, 36.0)),
        Transform::from_xyz(-120.0, -100.0, 1.0),
        RigidBody::Dynamic,
        Collider::capsule(12.0, 8.0),
        Friction::new(0.8),
        Restitution::new(0.2),
        LockedAxes::ROTATION_LOCKED,
    ));
}

fn spawn_weapon_crates(mut commands: Commands) {
    commands.spawn((
        WeaponCrate {
            kind: WeaponKind::FishBazooka,
            respawn_timer: Timer::from_seconds(6.0, TimerMode::Once),
        },
        Sprite::from_color(Color::srgb(1.0, 0.37, 0.12), Vec2::new(20.0, 20.0)),
        Transform::from_xyz(0.0, -40.0, 1.0),
    ));
}

fn dude_movement_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(&mut LinearVelocity, &mut DudeActor)>,
) {
    for (mut velocity, mut dude) in &mut query {
        let mut move_x = 0.0;
        if keyboard.pressed(KeyCode::KeyA) {
            move_x -= 1.0;
            dude.facing_dir = -1.0;
        }
        if keyboard.pressed(KeyCode::KeyD) {
            move_x += 1.0;
            dude.facing_dir = 1.0;
        }

        let speed = if dude.kind == DudeKind::Alien { 310.0 } else { 260.0 };
        velocity.x = move_x * speed;

        let max_jumps = if dude.kind == DudeKind::Swashbuckler { 3 } else { 2 };
        if keyboard.just_pressed(KeyCode::Space) && (dude.is_grounded || dude.jump_count < max_jumps) {
            velocity.y = 490.0;
            dude.is_grounded = false;
            dude.jump_count += 1;
        }
    }
}

fn dude_ability_system(
    mut commands: Commands,
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(Entity, &mut LinearVelocity, &mut DudeActor, &Transform)>,
) {
    for (entity, mut velocity, mut dude, transform) in &mut query {
        if keyboard.just_pressed(KeyCode::KeyQ) && dude.ability_cooldown.finished() {
            dude.ability_cooldown.reset();
            match dude.kind {
                DudeKind::Astronaut => {
                    // Zero-G Thruster: High vertical and horizontal boost
                    velocity.y = 560.0;
                    velocity.x += dude.facing_dir * 380.0;
                }
                DudeKind::Wizard => {
                    // Arcane Blink: Teleport dash in facing direction
                    commands.entity(entity).insert(Transform::from_xyz(
                        transform.translation.x + dude.facing_dir * 180.0,
                        transform.translation.y,
                        transform.translation.z,
                    ));
                }
                DudeKind::Swashbuckler => {
                    // Shadow Blade Dash
                    velocity.x = dude.facing_dir * 600.0;
                }
                _ => {}
            }
        }
    }
}

fn dude_weapon_fire_system(
    mut commands: Commands,
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(Entity, &mut DudeActor, &Transform)>,
) {
    for (entity, dude, transform) in &mut query {
        if keyboard.just_pressed(KeyCode::KeyJ) {
            if let Some(weapon) = dude.equipped_weapon {
                let recoil_force = match weapon {
                    WeaponKind::BubbleBlaster => 320.0,
                    WeaponKind::FishBazooka => 680.0,
                    WeaponKind::LaserPike => 180.0,
                };

                let dampener = if dude.kind == DudeKind::Dragon { 0.5 } else { 1.0 };

                // Linear Recoil Kick Impulse (Avian2D Physics)
                commands.entity(entity).insert(ExternalImpulse {
                    impulse: Vec2::new(-dude.facing_dir * recoil_force * dampener, 40.0),
                    ..default()
                });

                // Spawn Projectile
                commands.spawn((
                    Projectile {
                        damage: 35.0,
                        lifetime: Timer::from_seconds(2.0, TimerMode::Once),
                        owner: entity,
                        is_plasma: false,
                    },
                    Sprite::from_color(Color::srgb(1.0, 0.37, 0.12), Vec2::new(10.0, 6.0)),
                    Transform::from_xyz(transform.translation.x + dude.facing_dir * 20.0, transform.translation.y, 1.0),
                    RigidBody::Dynamic,
                    Collider::circle(4.0),
                    LinearVelocity(Vec2::new(dude.facing_dir * 600.0, 0.0)),
                ));
            }
        }
    }
}

fn recoil_physics_system() {}
fn projectile_ballistics_system() {}
fn deathmatch_scoring_system() {}`,
      chatHistory: [
        {
          id: 'm-jumpy-1',
          sender: 'designer',
          text: "Welcome to Jumpy Dudes! I am your Bevy MCP Game Architect. Let's design a tactical 2D platform brawler where every Dude from the roster has their own signature ability (Zero-G Thruster, Arcane Blink, Dragon's Breath, EMP Forcefield, Glacial Nova, and more) powered by Bevy 0.15 and Rapier2D / Avian2D physics.",
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'm-jumpy-2',
          sender: 'designer',
          text: 'Loaded all 190 Dude characters from the repository into our 2D tactical arena! You can switch Dudes anytime in the selector strip to unleash their abilities: Astro Dude Zero-G float, Alien plasma orbs, Wizard teleport blinks, Dragon fire breath, Mega Bot EMP shield, Swashbuckler triple jump, Ice freeze, Vampire lifesteal, and more!',
          timestamp: Date.now() - 3000000,
          bevyUpdate: 'Setup Bevy 0.15 + Avian2d DudeActor, DudeKind abilities, and linear recoil impulse system',
        },
      ],
      pendingQuestion: {
        id: 'q-jumpy-abilities',
        category: 'physics',
        title: 'Step 1: Dude Ability Cooldowns & Balance',
        description: 'How frequently should Dudes be able to unleash their signature abilities in combat?',
        options: [
          {
            id: 'opt-ability-tactical',
            label: 'Tactical Cadence (4-6s Cooldowns with High-Impact Plays)',
            description: 'Strategic timing where abilities turn the tide of high-stakes duels.',
            physicsSnippet: 'AbilityCooldown::new(4.5..6.0s) & high-impact momentum impulses',
          },
          {
            id: 'opt-ability-mayhem',
            label: 'Ability Mayhem (2-3s Fast Cooldowns for Nonstop Action)',
            description: 'Chaotic party mode with constant teleports, fire breath, and zero-g boosts.',
            physicsSnippet: 'AbilityCooldown::new(2.5s) & rapid energy recharge',
          },
          {
            id: 'opt-ability-meter',
            label: 'Overdrive Meter (Charges on Weapon Hits and Knockouts)',
            description: 'Reward landing weapon shots to build up super ability charges.',
            physicsSnippet: 'OverdriveMeter: charge += damage_dealt * 0.4',
          },
        ],
      },
    },
    {
      id: 'avian-bounce-arena',
      title: 'Avian Bounce Arena',
      tagline: 'High-energy 2D multiplayer ball brawler with elastic Avian restitution bumpers',
      dimension: '2d',
      bevyVersion: '0.15',
      avianVersion: '0.2',
      status: 'published',
      playCount: 142,
      likes: 38,
      thumbnailColor: '#0ABAB5',
      physicsConfig: {
        gravity: 9.81,
        restitution: 0.88,
        friction: 0.15,
        linearDamping: 0.05,
        substeps: 8,
      },
      gameLoop: {
        modeName: 'Last Orb Standing',
        cameraPerspective: '2d_topdown',
        primaryInput: 'Mouse Impulse Aim',
        objective: 'Knock opponent orbs out of the arena into the void boundaries',
        scoringRule: '+1 Point per ring-out',
        failCondition: 'Player orb exits perimeter bounds',
      },
      lightyearConfig: {
        transport: 'webtransport',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 12,
        enableAvianRollback: true,
        interestManagement: false,
      },
      bevyCode: `//! Bevy 0.15 + Avian2d 0.2 Bounce Arena
use bevy::prelude::*;
use avian2d::prelude::*;

fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins,
            PhysicsPlugins::default(),
        ))
        .insert_resource(Gravity(Vec2::NEG_Y * 98.1))
        .add_systems(Startup, setup_arena)
        .add_systems(Update, (player_impulse_system, arena_boundary_check))
        .run();
}

#[derive(Component)]
struct PlayerOrb;

fn setup_arena(mut commands: Commands) {
    commands.spawn(Camera2d);

    // Spawn player dynamic orb with Avian Collider & Restitution
    commands.spawn((
        PlayerOrb,
        Sprite::from_color(Color::srgb(0.04, 0.73, 0.71), Vec2::splat(36.0)),
        Transform::from_xyz(0.0, 50.0, 0.0),
        RigidBody::Dynamic,
        Collider::circle(18.0),
        Restitution::new(0.88),
        Friction::new(0.15),
    ));

    // Spawn static arena bumpers
    for x in [-120.0, 0.0, 120.0] {
        commands.spawn((
            Sprite::from_color(Color::srgb(0.9, 0.9, 0.9), Vec2::splat(40.0)),
            Transform::from_xyz(x, -60.0, 0.0),
            RigidBody::Static,
            Collider::circle(20.0),
            Restitution::new(0.95),
        ));
    }
}

fn player_impulse_system(
    buttons: Res<ButtonInput<MouseButton>>,
    windows: Query<&Window>,
    mut query: Query<(&Transform, &mut LinearVelocity), With<PlayerOrb>>,
) {
    if buttons.just_pressed(MouseButton::Left) {
        if let Ok((transform, mut velocity)) = query.get_single_mut() {
            if let Some(cursor) = windows.single().cursor_position() {
                let dir = (cursor - transform.translation.xy()).normalize_or_zero();
                velocity.0 += dir * 250.0;
            }
        }
    }
}

fn arena_boundary_check(
    mut commands: Commands,
    query: Query<(Entity, &Transform), With<PlayerOrb>>,
) {
    for (entity, transform) in &query {
        if transform.translation.length() > 500.0 {
            commands.entity(entity).despawn();
        }
    }
}`,
      chatHistory: [
        {
          id: 'm-1',
          sender: 'designer',
          text: 'Welcome to the Bevy & Avian Studio! I am your Bevy MCP Game Architect. Let us design Avian Bounce Arena.',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'm-2',
          sender: 'designer',
          text: 'We configured a 2D top-down physics ring with high-restitution Avian bumpers (0.88 bounciness) and mouse click impulses.',
          timestamp: Date.now() - 3000000,
          bevyUpdate: 'Setup arena with avian2d RigidBody::Dynamic and Restitution::new(0.88)',
        },
      ],
      pendingQuestion: {
        id: 'q-mode-mechanic',
        category: 'mode',
        title: 'Step 1: Choose Arena Win Condition',
        description: 'How should players score points or win the match in Avian Bounce Arena?',
        options: [
          {
            id: 'opt-ringout',
            label: 'Sumo Ring-Out (Knockout)',
            description: 'Knock opponents past the perimeter border into the void to score.',
            physicsSnippet: 'Transform.translation.length() > radius trigger despawn & score event',
          },
          {
            id: 'opt-target-bumper',
            label: 'High-Score Bumper Pinball',
            description: 'Hit glowing bumpers to accumulate points before the timer runs out.',
            physicsSnippet: 'CollisionStarted observer with ScoreTracker component addition',
          },
          {
            id: 'opt-elimination',
            label: 'Energy Depletion on Impact',
            description: 'Collisions deplete health proportional to Avian LinearVelocity magnitude.',
            physicsSnippet: 'LinearVelocity.length() factored into health damage system',
          },
        ],
      },
    },
    {
      id: 'orbit-strike-zero',
      title: 'Orbit Strike Zero',
      tagline: 'Gravitational orbital dogfight with point-mass attractors and Avian sensor collisions',
      dimension: '2d',
      bevyVersion: '0.15',
      avianVersion: '0.2',
      status: 'published',
      playCount: 96,
      likes: 24,
      thumbnailColor: '#FF5F1F',
      physicsConfig: {
        gravity: 4.5,
        restitution: 0.65,
        friction: 0.05,
        linearDamping: 0.02,
        substeps: 12,
      },
      gameLoop: {
        modeName: 'Orbital Dogfight',
        cameraPerspective: '2d_topdown',
        primaryInput: 'Keyboard Thrust & Gyro',
        objective: 'Orbit central singularity while launching projectile torpedos at enemy satellites',
        scoringRule: '+100 per satellite disabled',
        failCondition: 'Crashing into the singularity gravity well',
      },
      lightyearConfig: {
        transport: 'udp_netcode',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 32,
        enableAvianRollback: true,
        interestManagement: true,
      },
      bevyCode: `//! Bevy 0.15 + Avian2d 0.2 Orbit Strike Zero
use bevy::prelude::*;
use avian2d::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, PhysicsPlugins::default()))
        .insert_resource(Gravity(Vec2::ZERO)) // Zero global gravity; custom point attractor
        .add_systems(Startup, setup_orbit_world)
        .add_systems(Update, (apply_central_gravity, ship_thrust_system))
        .run();
}

#[derive(Component)]
struct OrbitShip;

fn setup_orbit_world(mut commands: Commands) {
    commands.spawn(Camera2d);

    // Central Attractor (Singularity)
    commands.spawn((
        Sprite::from_color(Color::srgb(1.0, 0.37, 0.12), Vec2::splat(48.0)),
        Transform::from_xyz(0.0, 0.0, 0.0),
        RigidBody::Static,
        Collider::circle(24.0),
    ));

    // Player Ship in stable orbit
    commands.spawn((
        OrbitShip,
        Sprite::from_color(Color::srgb(0.04, 0.73, 0.71), Vec2::new(24.0, 16.0)),
        Transform::from_xyz(0.0, 180.0, 0.0),
        RigidBody::Dynamic,
        Collider::capsule(12.0, 8.0),
        LinearVelocity(Vec2::new(120.0, 0.0)),
        AngularDamping(0.8),
    ));
}

fn apply_central_gravity(mut query: Query<(&Transform, &mut LinearVelocity), With<OrbitShip>>) {
    let center = Vec2::ZERO;
    let g_constant = 250000.0;

    for (transform, mut velocity) in &mut query {
        let delta = center - transform.translation.xy();
        let dist = delta.length().max(30.0);
        let force = delta.normalize() * (g_constant / (dist * dist));
        velocity.0 += force * 0.016;
    }
}

fn ship_thrust_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<(&Transform, &mut LinearVelocity), With<OrbitShip>>,
) {
    for (transform, mut velocity) in &mut query {
        if keyboard.pressed(KeyCode::KeyW) || keyboard.pressed(KeyCode::ArrowUp) {
            let forward = transform.up().xy();
            velocity.0 += forward * 5.0;
        }
    }
}`,
      chatHistory: [
        {
          id: 'm-orbit-1',
          sender: 'designer',
          text: 'Orbit Strike Zero is configured with point-mass gravitational simulation in Avian2D.',
          timestamp: Date.now() - 1200000,
        },
      ],
      pendingQuestion: {
        id: 'q-orbit-weapons',
        category: 'controls',
        title: 'Step 2: Orbital Weapons & Sensors',
        description: 'How should torpedoes interact with the central gravity well and ships?',
        options: [
          {
            id: 'opt-kinetic-slugs',
            label: 'Kinetic Unpowered Slugs',
            description: 'Projectiles are subject to gravity and can slingshot around the center.',
            physicsSnippet: 'Spawn projectile with RigidBody::Dynamic and affected by attractor',
          },
          {
            id: 'opt-seeking-missile',
            label: 'Guided Micro-Thrusters',
            description: 'Rockets exert linear thrust towards nearest enemy sensor signature.',
            physicsSnippet: 'Sensor collider scanning for ships within 200px radius',
          },
        ],
      },
    },
    {
      id: 'petri-pinball',
      title: 'Petri Pinball',
      tagline: 'Classic arcade flipper mechanics with Avian physics revolute joints and neon bumpers',
      dimension: '2d',
      bevyVersion: '0.15',
      avianVersion: '0.2',
      status: 'drafting',
      playCount: 0,
      likes: 12,
      thumbnailColor: '#8b5cf6',
      physicsConfig: {
        gravity: 14.0,
        restitution: 0.92,
        friction: 0.08,
        linearDamping: 0.01,
        substeps: 10,
      },
      gameLoop: {
        modeName: 'High Score Arcade',
        cameraPerspective: '2d_topdown',
        primaryInput: 'A/D or Left/Right Keys for Flippers',
        objective: 'Keep ball in play and trigger bumper combo multipliers',
        scoringRule: '100 points per bumper hit * combo multiplier',
        failCondition: 'Ball drops through the flipper gap',
      },
      lightyearConfig: {
        transport: 'websocket',
        predictionMode: 'snapshot_interpolation',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 15,
        enableAvianRollback: false,
        interestManagement: false,
      },
      bevyCode: `//! Bevy 0.15 + Avian2d 0.2 Petri Pinball
use bevy::prelude::*;
use avian2d::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, PhysicsPlugins::default()))
        .insert_resource(Gravity(Vec2::NEG_Y * 140.0))
        .add_systems(Startup, setup_pinball_table)
        .run();
}

fn setup_pinball_table(mut commands: Commands) {
    commands.spawn(Camera2d);

    // Ball
    commands.spawn((
        Sprite::from_color(Color::WHITE, Vec2::splat(20.0)),
        Transform::from_xyz(0.0, 150.0, 0.0),
        RigidBody::Dynamic,
        Collider::circle(10.0),
        Restitution::new(0.92),
    ));
}`,
      chatHistory: [
        {
          id: 'm-pin-1',
          sender: 'designer',
          text: 'Petri Pinball project initialized with steep vertical gravity and high restitution.',
          timestamp: Date.now() - 600000,
        },
      ],
      pendingQuestion: {
        id: 'q-flipper-mechanics',
        category: 'controls',
        title: 'Step 1: Flipper Angular Velocity & Torque',
        description: 'Choose how flipper physics are driven in Avian:',
        options: [
          {
            id: 'opt-joint-revolute',
            label: 'Avian Revolute Joint with Limits',
            description: 'Physical joint with min/max angle and motor torque springs.',
            physicsSnippet: 'commands.spawn(RevoluteJoint::new(table, flipper).with_angle_limits(-0.4, 0.4))',
          },
          {
            id: 'opt-kinematic-angular',
            label: 'Kinematic Angular Velocity',
            description: 'Directly set angular velocity on keypress for crisp arcade response.',
            physicsSnippet: 'RigidBody::Kinematic with AngularVelocity(25.0)',
          },
        ],
      },
    },
  ]);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('stumble-blobs-3d');

  const activeGame =
    gameWorkspaces.find((w) => w.id === activeWorkspaceId) || gameWorkspaces[0];

  // Handle answering interactive design question
  const handleAnswerQuestion = (optionId: string, customText?: string) => {
    if (!activeGame.pendingQuestion) return;

    const answeredOption = activeGame.pendingQuestion.options.find((o) => o.id === optionId);
    const chosenText = answeredOption?.label || customText || 'Custom mechanic selected';

    const userMessage = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text: customText ? `${chosenText}: ${customText}` : chosenText,
      timestamp: Date.now(),
    };

    // Synthesize follow-up from Bevy MCP Agent
    let designerResponse = '';
    let bevySnippetUpdate = '';
    let nextQuestion: GameQuestion | undefined = undefined;

    if (activeGame.id === 'stumble-blobs-3d') {
      if (activeGame.pendingQuestion.id === 'q-blob-lumpiness') {
        designerResponse = `Applied blob lumpiness: ${chosenText}. Synthesized squishy vertex harmonic deform and Avian3D capsule restitution.`;
        bevySnippetUpdate = 'Updated avian3d Collider::capsule & vertex harmonic wobble';
        nextQuestion = {
          id: 'q-stumble-hazards',
          category: 'rules',
          title: 'Step 2: Rotating Obstacles & Sweeper Speed',
          description: 'How punishing should the rotating sweepers and hammers be in the knockout race?',
          options: [
            {
              id: 'opt-sweeper-party',
              label: 'Party Fun (1.8 rad/s sweeper rotation + Mild bounce)',
              description: 'Accessible party race with forgiving recoveries.',
              physicsSnippet: 'AngularVelocity(Vec3::Y * 1.8)',
            },
            {
              id: 'opt-sweeper-chaos',
              label: 'Knockout Chaos (2.8 rad/s sweeper rotation + High impulse)',
              description: 'Classic Stumble Guys experience with chaotic mid-air pileups.',
              physicsSnippet: 'AngularVelocity(Vec3::Y * 2.8) & high impulse response',
            },
            {
              id: 'opt-sweeper-hardcore',
              label: 'Sudden Death (3.8 rad/s super-fast sweeper)',
              description: 'Demanding precision timing to dodge the sweepers.',
              physicsSnippet: 'AngularVelocity(Vec3::Y * 3.8)',
            },
          ],
        };
      } else if (activeGame.pendingQuestion.id === 'q-stumble-hazards') {
        designerResponse = `Sweeper obstacle speed calibrated to ${chosenText}! Adding qualification gate system and lobby capacity.`;
        bevySnippetUpdate = 'Configured kinematic sweeper rotation & finish gate collision observer';
        nextQuestion = {
          id: 'q-stumble-elimination',
          category: 'mode',
          title: 'Step 3: Elimination Threshold & Lobby Size',
          description: 'Select qualification rules for the multiplayer lobby:',
          options: [
            {
              id: 'opt-top8-qualify',
              label: 'First 8 Blobs Qualify (32-Player Tournament Bracket)',
              description: 'Multi-round knockout party battle.',
              physicsSnippet: 'finish_line_sensor counts qualified entities <= 8',
            },
            {
              id: 'opt-top4-qualify',
              label: 'First 4 Blobs Qualify (Quick 16-Player Sprint)',
              description: 'Fast-paced elimination for LAN party play.',
              physicsSnippet: 'finish_line_sensor counts qualified entities <= 4',
            },
          ],
        };
      } else if (activeGame.pendingQuestion.id === 'q-stumble-elimination') {
        designerResponse = `Elimination threshold configured to ${chosenText}! Now let us configure Lightyear 0.29 server authority and client prediction.`;
        bevySnippetUpdate = 'Configured match qualification counter & round advancement trigger';
        nextQuestion = {
          id: 'q-stumble-netcode',
          category: 'rules',
          title: 'Step 4: Lightyear Server Authority & Prediction Mode',
          description: 'Configure Lightyear server-authoritative multiplayer replication and Avian3D physics rollback:',
          options: [
            {
              id: 'opt-net-rollback',
              label: 'Client Prediction with Avian3D Rollback (WebTransport)',
              description: 'Zero input latency for local blob movement; resimulates Avian3D frames on misprediction.',
              physicsSnippet: 'lightyear::prelude::client::PredictionConfig::default() + avian3d rollback',
            },
            {
              id: 'opt-net-snapshot',
              label: 'Snapshot Interpolation (Smoothed Server Truth)',
              description: 'Interpolates remote entities smoothly at 60Hz tick without physics rollback.',
              physicsSnippet: 'lightyear::prelude::client::InterpolationConfig::default()',
            },
          ],
        };
      } else {
        designerResponse = `Stumble Blobs 3D loop and Lightyear 0.29 netcode finalized! 3D obstacle course, squishy lumpy blobs, rotating sweepers, and server-authoritative prediction are active. Switch to the 'Lightyear Netcode' tab to simulate latency and packet drop, or launch a lobby!`;
        bevySnippetUpdate = 'Complete Bevy 0.15 + Avian3d + Lightyear 0.29 netcode compiled';
        nextQuestion = undefined;
      }
    } else if (activeGame.id === 'jumpy') {
      if (activeGame.pendingQuestion.id === 'q-jumpy-abilities') {
        designerResponse = `Calibrated Dude character abilities: ${chosenText}. Added cooldown timers, passive modifiers, and active particle durations to Bevy ECS DudeActor components.`;
        bevySnippetUpdate = 'Updated dude_ability_system & ability cooldown timers';
        nextQuestion = {
          id: 'q-jumpy-weapons',
          category: 'rules',
          title: 'Step 2: Tactical Weapon Arsenal & Crate Spawns',
          description: 'Which weapons should spawn in the arena floating crate locations alongside character abilities?',
          options: [
            {
              id: 'opt-wep-classic',
              label: 'Classic Arsenal (Bubble Blaster, Fish Bazooka, Laser Pike)',
              description: 'Balanced mix of rapid fire, high explosive area recoil, and sniper beam.',
              physicsSnippet: 'Weapons: BubbleBlaster(320 recoil), Bazooka(680 recoil), LaserPike(180 recoil)',
            },
            {
              id: 'opt-wep-explosive',
              label: 'Rocket Mayhem (Heavy Bazookas & Fish Grenades only)',
              description: 'High explosion radius with extreme recoil rocket-jumping mechanics.',
              physicsSnippet: 'Weapons: Bazooka(750 recoil, 120 splash radius)',
            },
            {
              id: 'opt-wep-blaster',
              label: 'Bubble Blitz (Rapid bounce bubbles & high friction)',
              description: 'Fast tactical skirmishes with bouncy wall ricochet bullets.',
              physicsSnippet: 'Weapons: BubbleBlaster with 4x ricochet bounce',
            },
          ],
        };
      } else if (activeGame.pendingQuestion.id === 'q-jumpy-weapons') {
        designerResponse = `Configured weapon crate pool: ${chosenText}! Adding stock lives and respawn logic.`;
        bevySnippetUpdate = 'Configured WeaponCrate respawn timers & projectile collision listeners';
        nextQuestion = {
          id: 'q-jumpy-match-mode',
          category: 'mode',
          title: 'Step 3: Win Condition & Stock Lives',
          description: 'Select the primary match rule for Dudes tactical arena:',
          options: [
            {
              id: 'opt-stocks-3',
              label: '3 Stock Lives (Last Dude Standing Wins)',
              description: 'Competitive tournament standard for tactical platform brawlers.',
              physicsSnippet: 'MatchRule::StockLives(3)',
            },
            {
              id: 'opt-ko-race',
              label: 'First to 5 Knockouts (Timed Deathmatch)',
              description: 'Continuous respawns until one Dude reaches 5 KOs.',
              physicsSnippet: 'MatchRule::FirstToKOs(5)',
            },
          ],
        };
      } else if (activeGame.pendingQuestion.id === 'q-jumpy-match-mode') {
        designerResponse = `Match format set: ${chosenText}! Let us finalize Lightyear 0.29 replication and hit registration for character abilities.`;
        bevySnippetUpdate = 'Configured match stock scoring and spawn point systems';
        nextQuestion = {
          id: 'q-jumpy-netcode',
          category: 'rules',
          title: 'Step 4: Lightyear Netcode & Ability Hitreg',
          description: 'Select rollback and hit registration policy for fast-paced Dude projectile battles:',
          options: [
            {
              id: 'opt-jumpy-rewind',
              label: 'Server Rewind Hitreg & Full Prediction (Lightyear WebTransport)',
              description: 'Accurate high-speed projectile collision with server-side lag compensation.',
              physicsSnippet: 'PredictionPlugin + ServerLagCompensation with Avian2d query rewind',
            },
            {
              id: 'opt-jumpy-deterministic',
              label: 'Deterministic Lockstep Tick (Low Bandwidth)',
              description: 'All clients execute identical fixed Avian ticks in lockstep.',
              physicsSnippet: 'LockstepFixedUpdate + 60Hz tick step synchronization',
            },
          ],
        };
      } else {
        designerResponse = `Jumpy Dudes tactical arena loop and Lightyear netcode finalized! 12 playable Dudes with unique abilities, weapon recoil physics, and server-authoritative prediction are ready. Check the 'Lightyear Netcode' tab to test rollback telemetry!`;
        bevySnippetUpdate = 'Complete Bevy 0.15 + Avian2d + Lightyear 0.29 Tactical Brawler compiled';
        nextQuestion = undefined;
      }
    } else if (activeGame.pendingQuestion.category === 'mode') {
      designerResponse = `Excellent choice! Implemented ${chosenText}. Added an Avian observer system to watch for entity perimeter breaches and trigger score state dispatch.`;
      bevySnippetUpdate = 'Add boundary check system & score broadcast observer';
      nextQuestion = {
        id: 'q-physics-restitution',
        category: 'physics',
        title: 'Step 2: Ball Restitution & Elasticity',
        description: 'How bouncy should the physics materials feel during collisions?',
        options: [
          {
            id: 'opt-super-elastic',
            label: 'Super-Bouncy (0.95 Restitution)',
            description: 'Near-perpetual kinetic momentum. Chaotic fun.',
            physicsSnippet: 'Restitution::new(0.95)',
          },
          {
            id: 'opt-moderate',
            label: 'Controlled Sports Ball (0.75 Restitution)',
            description: 'Realistic squash and bounce. Tactical precision.',
            physicsSnippet: 'Restitution::new(0.75)',
          },
          {
            id: 'opt-low-damping',
            label: 'Heavy Metal Core (0.40 Restitution + Heavy Mass)',
            description: 'Low bounce, high impact impulse displacement.',
            physicsSnippet: 'Restitution::new(0.40) & Mass(5.0)',
          },
        ],
      };
    } else if (activeGame.pendingQuestion.category === 'physics') {
      designerResponse = `Applied physics material configuration: ${chosenText}. Updated the Restitution component across all dynamic colliders.`;
      bevySnippetUpdate = 'Updated Restitution & Friction components in Bevy ECS world';
      nextQuestion = {
        id: 'q-rules-powerups',
        category: 'rules',
        title: 'Step 3: Powerup & Hazard Spawn Loop',
        description: 'Would you like random powerups (Speed boost, Mass multiplier) spawned by timer?',
        options: [
          {
            id: 'opt-powerups-yes',
            label: 'Timed Spawn of Mass & Speed Pickups',
            description: 'Spawn pickups every 8s using Bevy Timer and Avian Sensor colliders.',
            physicsSnippet: 'Collider::circle(12.0) with Sensor component',
          },
          {
            id: 'opt-pure-skill',
            label: 'Pure Skill (No Random Pickups)',
            description: 'Clean competitive physics without external variables.',
            physicsSnippet: 'No secondary pickup entities spawned',
          },
        ],
      };
    } else {
      designerResponse = `Game loop specification finalized for ${activeGame.title}! The Bevy ECS architecture is compiled and ready for preview or publishing.`;
      bevySnippetUpdate = 'Complete Bevy 0.15 + Avian2D game loop ready';
      nextQuestion = undefined;
    }

    const designerMessage = {
      id: `d-${Date.now() + 1}`,
      sender: 'designer' as const,
      text: designerResponse,
      timestamp: Date.now() + 1,
      bevyUpdate: bevySnippetUpdate,
      question: nextQuestion,
    };

    setGameWorkspaces((prev) =>
      prev.map((g) => {
        if (g.id === activeGame.id) {
          const currentLightyear = g.lightyearConfig;
          const updatedLightyear = currentLightyear
            ? {
                ...currentLightyear,
                predictionMode:
                  optionId === 'opt-net-rollback' || optionId === 'opt-jumpy-rewind'
                    ? ('full_rollback' as const)
                    : optionId === 'opt-net-snapshot'
                    ? ('snapshot_interpolation' as const)
                    : optionId === 'opt-jumpy-deterministic'
                    ? ('lockstep' as const)
                    : currentLightyear.predictionMode,
              }
            : undefined;

          return {
            ...g,
            physicsConfig: {
              ...g.physicsConfig,
              restitution:
                optionId === 'opt-super-elastic'
                  ? 0.95
                  : optionId === 'opt-moderate'
                  ? 0.75
                  : g.physicsConfig.restitution,
            },
            lightyearConfig: updatedLightyear || g.lightyearConfig,
            chatHistory: [...g.chatHistory, userMessage, designerMessage],
            pendingQuestion: nextQuestion,
          };
        }
        return g;
      })
    );
  };

  const handleSendMessage = (text: string) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: Date.now(),
    };

    const designerMsg = {
      id: `d-${Date.now() + 1}`,
      sender: 'designer' as const,
      text: `Ingested mechanic specification: "${text}". Synthesizing corresponding Bevy ECS systems and Avian physics colliders...`,
      timestamp: Date.now() + 1,
      bevyUpdate: `Synthesized system for: ${text.slice(0, 30)}...`,
    };

    setGameWorkspaces((prev) =>
      prev.map((g) =>
        g.id === activeGame.id
          ? { ...g, chatHistory: [...g.chatHistory, userMsg, designerMsg] }
          : g
      )
    );
  };

  const handleResetInterview = () => {
    setGameWorkspaces((prev) =>
      prev.map((g) => {
        if (g.id === activeGame.id) {
          return {
            ...g,
            chatHistory: [
              {
                id: `m-init-${Date.now()}`,
                sender: 'designer',
                text: `Restarted design interview for ${g.title}. What core mechanics would you like to build?`,
                timestamp: Date.now(),
              },
            ],
            pendingQuestion: {
              id: 'q-restart-mode',
              category: 'mode',
              title: 'Step 1: Game Mode & Objective',
              description: 'Select the primary gameplay loop:',
              options: [
                {
                  id: 'opt-arena',
                  label: 'Sumo Bounce Arena',
                  description: 'Knock opponents off the perimeter with impulsive collisions.',
                },
                {
                  id: 'opt-race',
                  label: 'Physics Time Trial',
                  description: 'Navigate obstacle courses with restitution momentum.',
                },
              ],
            },
          };
        }
        return g;
      })
    );
  };

  const handleCreateWorkspace = (partial: Partial<GameWorkspace>) => {
    const newWs: GameWorkspace = {
      id: partial.id || `game-${Date.now()}`,
      title: partial.title || 'Untitled Game',
      tagline: partial.tagline || 'Custom Bevy & Avian physics game',
      dimension: partial.dimension || '2d',
      bevyVersion: '0.15',
      avianVersion: '0.2',
      status: 'drafting',
      playCount: 0,
      likes: 0,
      thumbnailColor: '#0ABAB5',
      physicsConfig: {
        gravity: 9.81,
        restitution: 0.85,
        friction: 0.1,
        linearDamping: 0.05,
        substeps: 8,
      },
      lightyearConfig: {
        transport: 'webtransport',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 20,
        enableAvianRollback: true,
        interestManagement: true,
      },
      gameLoop: {
        modeName: 'Custom Mode',
        cameraPerspective: partial.dimension === '3d' ? '3d_arena' : '2d_topdown',
        primaryInput: 'Keyboard & Mouse',
        objective: 'Defeat all targets or survive',
        scoringRule: 'Standard points',
        failCondition: 'Health reaches 0',
      },
      bevyCode: `//! Bevy 0.15 + ${partial.dimension === '3d' ? 'avian3d' : 'avian2d'} Game Scaffold
use bevy::prelude::*;
use ${partial.dimension === '3d' ? 'avian3d' : 'avian2d'}::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, PhysicsPlugins::default()))
        .run();
}`,
      chatHistory: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'designer',
          text: `Welcome! Created new workspace: ${partial.title}. Let us configure the core Avian physics and ECS loop.`,
          timestamp: Date.now(),
        },
      ],
      pendingQuestion: {
        id: 'q-new-mode',
        category: 'mode',
        title: 'Step 1: Choose Core Movement & Control',
        description: 'How does the player control their character in the physics world?',
        options: [
          {
            id: 'opt-mouse-impulse',
            label: 'Mouse Impulse Vector',
            description: 'Aim and launch impulses like a slingshot.',
          },
          {
            id: 'opt-wasd-velocity',
            label: 'Direct WASD / Kinematic Movement',
            description: 'Classic top-down or platformer controls.',
          },
        ],
      },
    };

    setGameWorkspaces((prev) => [newWs, ...prev]);
    setActiveWorkspaceId(newWs.id);
  };

  const handleUpdateLightyearConfig = (updated: Partial<LightyearConfig>) => {
    setGameWorkspaces((prev) =>
      prev.map((g) => {
        if (g.id === activeGame.id) {
          const currentConfig = g.lightyearConfig || {
            transport: 'webtransport',
            predictionMode: 'full_rollback',
            serverTickRate: 60,
            clientTickRate: 60,
            packetLossSimPercent: 0,
            latencySimMs: 24,
            enableAvianRollback: true,
            interestManagement: true,
          };
          return {
            ...g,
            lightyearConfig: {
              ...currentConfig,
              ...updated,
            },
          };
        }
        return g;
      })
    );
  };

  const handlePublishCurrent = (gameId: string) => {
    setGameWorkspaces((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status: 'published', playCount: 1 } : g))
    );
    setActiveSubTab('published');
  };

  const handleLaunchLobby = (game: GameWorkspace) => {
    const roomCode = `#ZERO-${Math.floor(1000 + Math.random() * 9000)}`;
    const joinUrl = `http://localhost:5173/lobby/${roomCode.replace('#ZERO-', '')}`;

    const newLobby: MultiplayerLobby = {
      gameId: game.id,
      gameTitle: game.title,
      roomCode,
      hostName: activeUser?.name.split(' ')[0] || 'Hideo',
      joinUrl,
      status: 'waiting',
      tickRateHz: 60,
      clientPrediction: true,
      lightyearConfig: game.lightyearConfig || {
        transport: 'webtransport',
        predictionMode: 'full_rollback',
        serverTickRate: 60,
        clientTickRate: 60,
        packetLossSimPercent: 0,
        latencySimMs: 24,
        enableAvianRollback: true,
        interestManagement: true,
      },
      peers: [
        {
          id: 'p-host',
          name: `${activeUser?.name.split(' ')[0] || 'Hideo'} (Host)`,
          role: 'host',
          pingMs: 2,
          isReady: true,
        },
        {
          id: 'p-peer-1',
          name: 'rtx-mesh-node (po)',
          role: 'player',
          pingMs: 14,
          isReady: true,
        },
      ],
    };

    setActiveLobby(newLobby);
    setIsLobbyOpen(true);
  };

  const handlePlayGame = (game: GameWorkspace, lobby?: MultiplayerLobby) => {
    setActiveWorkspaceId(game.id);
    setActivePlaySession({ gameId: game.id, lobby: lobby || null });
  };

  const handleStartMatch = (lobby: MultiplayerLobby) => {
    setIsLobbyOpen(false);
    setActiveWorkspaceId(lobby.gameId);
    const targetGame = gameWorkspaces.find((w) => w.id === lobby.gameId) || activeGame;
    handlePlayGame(targetGame, lobby);
  };

  const handleOpenEdit = (game: GameWorkspace) => {
    setEditingGame(game);
    setIsEditModalOpen(true);
  };

  const handleSaveWorkspace = (gameId: string, updates: Partial<GameWorkspace>) => {
    setGameWorkspaces((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteWorkspace = (gameId: string) => {
    setGameWorkspaces((prev) => {
      const remaining = prev.filter((g) => g.id !== gameId);
      if (remaining.length === 0) {
        const fallback: GameWorkspace = {
          id: 'arcade-sandbox',
          title: 'Arcade Physics Sandbox',
          tagline: 'Custom Bevy 0.15 & Avian physics game',
          dimension: '2d',
          bevyVersion: '0.15',
          avianVersion: '0.2',
          status: 'drafting',
          playCount: 0,
          likes: 0,
          thumbnailColor: '#0ABAB5',
          physicsConfig: {
            gravity: 9.81,
            restitution: 0.8,
            friction: 0.2,
            linearDamping: 0.05,
            substeps: 8,
          },
          gameLoop: {
            modeName: 'Sandbox Battle',
            cameraPerspective: '2d_topdown',
            primaryInput: 'Keyboard & Mouse',
            objective: 'Survive and knock opponents out',
            scoringRule: 'Standard points',
            failCondition: 'Health reaches 0',
          },
          bevyCode: `//! Bevy 0.15 + Avian2d Game\nuse bevy::prelude::*;\nuse avian2d::prelude::*;\n\nfn main() {\n    App::new().add_plugins((DefaultPlugins, PhysicsPlugins::default())).run();\n}`,
          chatHistory: [
            {
              id: `m-init-${Date.now()}`,
              sender: 'designer',
              text: 'Created fresh arcade workspace. What mechanics would you like to build?',
              timestamp: Date.now(),
            },
          ],
        };
        setActiveWorkspaceId(fallback.id);
        return [fallback];
      }
      if (activeWorkspaceId === gameId) {
        setActiveWorkspaceId(remaining[0].id);
      }
      return remaining;
    });
    if (activePlaySession?.gameId === gameId) {
      setActivePlaySession(null);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none font-sans text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Zero Studio Master Header with Subtle Depth */}
        <div className="subtle-depth rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-stone-200/80">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white font-medium text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                  0
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-stone-950 tracking-tight flex items-center space-x-2.5">
                    <span>Zero</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700">
                      Bevy & Avian Game Studio
                    </span>
                    {activeUser && (
                      <span className="text-xs font-normal text-stone-400">
                        · {activeUser.name.split(' ')[0]} ({activeUser.role.replace('_', ' ')})
                      </span>
                    )}
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-normal leading-relaxed pt-1">
                Data-driven Bevy ECS game engine studio with Avian physics, conversational game loop development, and QR-enabled multiplayer lobbies across {activeWorkspace?.name || 'zero-petri'}.
              </p>
            </div>

            {/* Sub-Tab Navigation Switcher */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-stone-100/70 border border-stone-200/80 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('studio')}
                className={`subtle-depth-interactive flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSubTab === 'studio'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Studio & Physics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('published')}
                className={`subtle-depth-interactive flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSubTab === 'published'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Published Games & Lobbies</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab 1: Game Workspace Strip */}
          {activeSubTab === 'studio' && !activePlaySession && (
            <GameWorkspaceSelector
              workspaces={gameWorkspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={setActiveWorkspaceId}
              onCreateWorkspace={handleCreateWorkspace}
              onPublishCurrent={handlePublishCurrent}
              onPlayWorkspace={(game) => handlePlayGame(game)}
              onEditWorkspace={handleOpenEdit}
              onDeleteWorkspace={handleDeleteWorkspace}
            />
          )}
        </div>

        {/* View Content based on Sub-Tab OR Dedicated Play Mode Theater */}
        {activePlaySession ? (
          <ActiveGameTheater
            game={gameWorkspaces.find((g) => g.id === activePlaySession.gameId) || activeGame}
            lobby={activePlaySession.lobby}
            onExit={() => setActivePlaySession(null)}
            onOpenInspector={() => {
              setActivePlaySession(null);
              setActiveSubTab('studio');
              setStudioRightPane('code');
            }}
          />
        ) : (
          <>
            {activeSubTab === 'studio' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Conversational Game Designer & Interactive Questions */}
                <div className="lg:col-span-6 h-[640px] flex flex-col">
                  <ConversationalGameDesigner
                    chatHistory={activeGame.chatHistory}
                    pendingQuestion={activeGame.pendingQuestion}
                    onAnswerQuestion={handleAnswerQuestion}
                    onSendMessage={handleSendMessage}
                    onResetInterview={handleResetInterview}
                  />
                </div>

                {/* Right Column: Interactive Avian Physics Canvas OR Bevy Code Inspector */}
                <div className="lg:col-span-6 h-[640px] flex flex-col space-y-3">
                  {/* Right Pane View Mode Switcher */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-stone-100/70 border border-stone-200/80">
                      <button
                        type="button"
                        onClick={() => setStudioRightPane('preview')}
                        className={`subtle-depth-interactive px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          studioRightPane === 'preview'
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Live Physics Canvas
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioRightPane('code')}
                        className={`subtle-depth-interactive px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          studioRightPane === 'code'
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Bevy ECS Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioRightPane('netcode')}
                        className={`subtle-depth-interactive flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          studioRightPane === 'netcode'
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5 text-[#FF5F1F]" />
                        <span>Lightyear Netcode</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500 font-sans">
                      {studioRightPane === 'preview'
                        ? '60Hz Avian Simulation'
                        : studioRightPane === 'code'
                        ? 'Idiomatic Rust Systems'
                        : 'Lightyear 0.29 Netcode & Rollback'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {studioRightPane === 'preview' ? (
                      activeGame.id === 'stumble-blobs-3d' ? (
                        <StumbleBlobsCanvas
                          gameTitle={activeGame.title}
                          physicsConfig={activeGame.physicsConfig}
                        />
                      ) : activeGame.id === 'jumpy' ? (
                        <JumpyFishCanvas
                          gameTitle={activeGame.title}
                          physicsConfig={activeGame.physicsConfig}
                        />
                      ) : activeGame.dimension === '3d' ? (
                        <StumbleBlobsCanvas
                          gameTitle={activeGame.title}
                          physicsConfig={activeGame.physicsConfig}
                        />
                      ) : (
                        <AvianPhysicsCanvas
                          gameTitle={activeGame.title}
                          physicsConfig={activeGame.physicsConfig}
                        />
                      )
                    ) : studioRightPane === 'code' ? (
                      <BevyCodeInspector
                        gameTitle={activeGame.title}
                        dimension={activeGame.dimension}
                        bevyCode={activeGame.bevyCode}
                        bevyVersion={activeGame.bevyVersion}
                        avianVersion={activeGame.avianVersion}
                      />
                    ) : (
                      <LightyearNetPanel
                        config={
                          activeGame.lightyearConfig || {
                            transport: 'webtransport',
                            predictionMode: 'full_rollback',
                            serverTickRate: 60,
                            clientTickRate: 60,
                            packetLossSimPercent: 0,
                            latencySimMs: 24,
                            enableAvianRollback: true,
                            interestManagement: true,
                          }
                        }
                        onUpdateConfig={handleUpdateLightyearConfig}
                        showGhostEntity={showGhostEntity}
                        onToggleGhostEntity={setShowGhostEntity}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Published Games Catalog & Multiplayer Lobbies */}
            {activeSubTab === 'published' && (
              <div className="subtle-depth rounded-2xl p-6 sm:p-8">
                <PublishedGamesCatalog
                  games={gameWorkspaces}
                  onPlayGame={(game) => handlePlayGame(game)}
                  onLaunchLobby={handleLaunchLobby}
                  onSelectStudioGame={(gameId) => {
                    setActiveWorkspaceId(gameId);
                    setActiveSubTab('studio');
                  }}
                  onEditGame={handleOpenEdit}
                  onDeleteGame={handleDeleteWorkspace}
                />
              </div>
            )}
          </>
        )}

        {/* Edit Game Modal */}
        <EditGameModal
          game={editingGame}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveWorkspace}
          onDelete={handleDeleteWorkspace}
        />

        {/* Multiplayer Lobby Modal with Scannable QR Code */}
        <MultiplayerLobbyModal
          lobby={activeLobby}
          isOpen={isLobbyOpen}
          onClose={() => setIsLobbyOpen(false)}
          onStartMatch={handleStartMatch}
        />
      </div>
    </div>
  );
};

export default ZeroView;
