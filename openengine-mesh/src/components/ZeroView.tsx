import React, { useState } from 'react';
import {
  Gamepad2,
  QrCode,
} from 'lucide-react';
import { Workspace, UserProfile, GameWorkspace, MultiplayerLobby, GameQuestion } from '../types';
import { GameWorkspaceSelector } from './zero/GameWorkspaceSelector';
import { ConversationalGameDesigner } from './zero/ConversationalGameDesigner';
import { AvianPhysicsCanvas } from './zero/AvianPhysicsCanvas';
import { BevyCodeInspector } from './zero/BevyCodeInspector';
import { PublishedGamesCatalog } from './zero/PublishedGamesCatalog';
import { MultiplayerLobbyModal } from './zero/MultiplayerLobbyModal';

interface ZeroViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  onDispatchIntent?: (prompt: string, kind: 'bug' | 'feat' | 'issue' | 'mile') => void;
}

export const ZeroView: React.FC<ZeroViewProps> = ({
  activeWorkspace,
  activeUser,
  onDispatchIntent,
}) => {
  // Sub-navigation: 'studio' | 'published'
  const [activeSubTab, setActiveSubTab] = useState<'studio' | 'published'>('studio');

  // Studio layout toggle: 'preview' (Physics canvas) | 'code' (Bevy Rust inspector)
  const [studioRightPane, setStudioRightPane] = useState<'preview' | 'code'>('preview');

  // Active Lobby Modal state
  const [activeLobby, setActiveLobby] = useState<MultiplayerLobby | null>(null);
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);

  // Initial Game Workspaces with distinct Avian physics settings and Bevy systems
  const [gameWorkspaces, setGameWorkspaces] = useState<GameWorkspace[]>([
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

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('avian-bounce-arena');

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

    if (activeGame.pendingQuestion.category === 'mode') {
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

  const handleStartMatch = (lobby: MultiplayerLobby) => {
    setIsLobbyOpen(false);
    setActiveSubTab('studio');
    setStudioRightPane('preview');
    // Dispatch notice or action
    onDispatchIntent?.(`Launch multiplayer game match: ${lobby.gameTitle} (${lobby.roomCode})`, 'feat');
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
          {activeSubTab === 'studio' && (
            <GameWorkspaceSelector
              workspaces={gameWorkspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={setActiveWorkspaceId}
              onCreateWorkspace={handleCreateWorkspace}
              onPublishCurrent={handlePublishCurrent}
            />
          )}
        </div>

        {/* View Content based on Sub-Tab */}
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
                </div>

                <span className="text-[11px] text-stone-500 font-sans">
                  {studioRightPane === 'preview' ? '60Hz Avian Simulation' : 'Idiomatic Rust Systems'}
                </span>
              </div>

              <div className="flex-1 overflow-hidden">
                {studioRightPane === 'preview' ? (
                  <AvianPhysicsCanvas
                    gameTitle={activeGame.title}
                    physicsConfig={activeGame.physicsConfig}
                  />
                ) : (
                  <BevyCodeInspector
                    gameTitle={activeGame.title}
                    dimension={activeGame.dimension}
                    bevyCode={activeGame.bevyCode}
                    bevyVersion={activeGame.bevyVersion}
                    avianVersion={activeGame.avianVersion}
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
              onLaunchLobby={handleLaunchLobby}
              onSelectStudioGame={(gameId) => {
                setActiveWorkspaceId(gameId);
                setActiveSubTab('studio');
              }}
            />
          </div>
        )}

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
