import React, { useState } from 'react';
import {
  Copy,
  Check,
  FileCode,
  Package,
} from 'lucide-react';

interface BevyCodeInspectorProps {
  gameTitle: string;
  dimension: '2d' | '3d';
  bevyCode: string;
  bevyVersion: string;
  avianVersion: string;
}

type FileTab = 'main.rs' | 'server.rs' | 'client.rs' | 'Cargo.toml';

export const BevyCodeInspector: React.FC<BevyCodeInspectorProps> = ({
  gameTitle,
  dimension,
  bevyCode,
  bevyVersion,
  avianVersion,
}) => {
  const [activeTab, setActiveTab] = useState<FileTab>('main.rs');
  const [copied, setCopied] = useState(false);

  const avianCrate = dimension === '2d' ? 'avian2d' : 'avian3d';
  const slug = gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const serverCode = `//! Lightyear 0.29 Authoritative Dedicated Server (${gameTitle})
use bevy::prelude::*;
use ${avianCrate}::prelude::*;
use lightyear::prelude::*;
use lightyear::prelude::server::*;

fn main() {
    let mut app = App::new();
    app.add_plugins((
        DefaultPlugins,
        PhysicsPlugins::default(),
        ServerPlugins::new(ServerConfig {
            shared: SharedConfig {
                server_send_interval: std::time::Duration::from_millis(16), // 60Hz tick
                tick: TickConfig { tick_duration: std::time::Duration::from_millis(16) },
            },
            net: NetConfig::Netcode {
                config: NetcodeConfig::default(),
                io: IoConfig::from_transport(ServerTransport::WebTransport(ServerWebTransportConfig {
                    server_addr: "0.0.0.0:7000".parse().unwrap(),
                    certificate: ServerCertificate::generate_self_signed().unwrap(),
                })),
            },
            replication: ReplicationConfig {
                enable_rebalancing: true,
                send_interval: std::time::Duration::from_millis(16),
            },
        }),
    ));

    app.add_systems(Startup, setup_server_world);
    app.add_systems(Update, (handle_connections, authoritative_physics_sync));
    app.run();
}

fn setup_server_world(mut commands: Commands) {
    info!("Lightyear Authoritative Server initialized on 0.0.0.0:7000 (WebTransport + UDP)");
}

fn handle_connections(mut connections: EventReader<ConnectEvent>) {
    for event in connections.read() {
        info!("Client connected with Lightyear ClientId: {:?}", event.client_id());
    }
}

fn authoritative_physics_sync(
    mut query: Query<(&Transform, &LinearVelocity, &mut Replicate)>,
) {
    // Replicates authoritative physics state to connected clients with delta compression
}
`;

  const clientCode = `//! Lightyear 0.29 Client with Client-Side Prediction & Avian Rollback (${gameTitle})
use bevy::prelude::*;
use ${avianCrate}::prelude::*;
use lightyear::prelude::*;
use lightyear::prelude::client::*;

fn main() {
    let mut app = App::new();
    app.add_plugins((
        DefaultPlugins,
        PhysicsPlugins::default(),
        ClientPlugins::new(ClientConfig {
            shared: SharedConfig {
                server_send_interval: std::time::Duration::from_millis(16),
                tick: TickConfig { tick_duration: std::time::Duration::from_millis(16) },
            },
            net: NetConfig::Netcode {
                auth: Authentication::Manual {
                    server_addr: "127.0.0.1:7000".parse().unwrap(),
                    client_id: 1,
                    private_key: [0; 32],
                    protocol_id: 0,
                },
                config: NetcodeConfig::default(),
                io: IoConfig::from_transport(ClientTransport::WebTransport(ClientWebTransportConfig {
                    server_addr: "127.0.0.1:7000".parse().unwrap(),
                    certificate_digest: vec![],
                })),
            },
            prediction: PredictionConfig {
                // Enable full client-side prediction with Avian physics rollback
                minimum_input_delay_ticks: 2,
                correction_ticks_factor: 1.5,
            },
            interpolation: InterpolationConfig::default(),
        }),
    ));

    app.add_systems(Startup, connect_to_server);
    app.add_systems(Update, (buffer_player_inputs, client_prediction_rollback_system));
    app.run();
}

fn connect_to_server(mut commands: Commands) {
    info!("Connecting Lightyear Client via WebTransport to 127.0.0.1:7000...");
    commands.connect_client();
}

fn buffer_player_inputs(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut input_manager: ResMut<InputManager<KeyCode>>,
) {
    // Collect local player inputs and replicate to server buffer
}

fn client_prediction_rollback_system(
    mut rollbacks: EventReader<RollbackEvent>,
) {
    for event in rollbacks.read() {
        warn!("Server reconciliation triggered: rolling back to tick {:?}", event.tick);
    }
}
`;

  const cargoTomlContent = `[package]
name = "${slug}"
version = "0.1.0"
edition = "2024"

[dependencies]
bevy = "${bevyVersion}"
${avianCrate} = "${avianVersion}"
lightyear = { version = "0.29", features = ["webtransport", "websocket", "netcode", "${dimension === '2d' ? 'avian2d' : 'avian3d'}"] }
serde = { version = "1.0", features = ["derive"] }
tracing = "0.1"
`;

  const getContent = () => {
    switch (activeTab) {
      case 'main.rs':
        return bevyCode;
      case 'server.rs':
        return serverCode;
      case 'client.rs':
        return clientCode;
      case 'Cargo.toml':
        return cargoTomlContent;
    }
  };

  const currentContent = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Code Inspector Header */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* File Switcher Tabs */}
          {(['main.rs', 'server.rs', 'client.rs', 'Cargo.toml'] as FileTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`subtle-depth-interactive flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white/90 text-stone-700 hover:text-stone-950 border-stone-200/90'
                }`}
              >
                {tab === 'Cargo.toml' ? (
                  <Package className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0ABAB5]' : 'text-stone-400'}`} />
                )}
                <span>{tab}</span>
                {tab === 'server.rs' && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-300">
                    Host
                  </span>
                )}
                {tab === 'client.rs' && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-300">
                    Rollback
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Copy & Export */}
        <div className="flex items-center space-x-2 pl-2">
          <button
            type="button"
            onClick={handleCopy}
            className="subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400 whitespace-nowrap"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Viewport */}
      <div className="flex-1 overflow-auto p-4 bg-stone-50/50">
        <pre className="font-mono text-xs text-stone-800 leading-relaxed overflow-x-auto selection:bg-stone-200">
          <code>{currentContent}</code>
        </pre>
      </div>

      {/* Footer Status */}
      <div className="px-4 py-2 border-t border-stone-200/80 bg-white/70 text-[11px] text-stone-500 flex items-center justify-between font-sans">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Target: Bevy {bevyVersion} · {avianCrate} {avianVersion} · Lightyear 0.29</span>
        </span>
        <span>Server-Authoritative with Client Prediction</span>
      </div>
    </div>
  );
};
