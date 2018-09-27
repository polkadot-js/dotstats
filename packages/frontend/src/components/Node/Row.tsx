import * as React from 'react';
import Identicon from 'polkadot-identicon';
import { Types } from '@dotstats/common';
import { formatNumber, milliOrSecond, secondsWithPrecision } from '../../utils';
import { State as AppState, Node } from '../../state';
import { PersistentSet } from '../../persist';
import { SEMVER_PATTERN } from './';
import { Ago, Icon } from '../';

import nodeIcon from '../../icons/server.svg';
import nodeLocationIcon from '../../icons/location.svg';
import nodeValidatorIcon from '../../icons/shield.svg';
import nodeTypeIcon from '../../icons/terminal.svg';
import peersIcon from '../../icons/broadcast.svg';
import transactionsIcon from '../../icons/inbox.svg';
import blockIcon from '../../icons/package.svg';
import blockHashIcon from '../../icons/file-binary.svg';
import blockTimeIcon from '../../icons/history.svg';
import propagationTimeIcon from '../../icons/dashboard.svg';
import lastTimeIcon from '../../icons/watch.svg';
import cpuIcon from '../../icons/microchip-solid.svg';
import memoryIcon from '../../icons/memory-solid.svg';

import parityPolkadotIcon from '../../icons/dot.svg';
import paritySubstrateIcon from '../../icons/parity-substrate.svg';
import unknownImplementationIcon from '../../icons/question-solid.svg';

import './Row.css';

interface RowProps {
  node: Node;
  settings: AppState.Settings;
  pins: PersistentSet<Types.NodeName>;
};

interface HeaderProps {
  settings: AppState.Settings;
};

interface Column {
  label: string;
  icon: string;
  width?: number;
  setting?: keyof AppState.Settings;
  render: (node: Node) => React.ReactElement<any> | string;
}

function Truncate(props: { text: string }): React.ReactElement<any> {
  const { text } = props;

  return <div className="Node-Row-truncate" title={text}>{text}</div>;
}

export default class Row extends React.Component<RowProps, {}> {
  public static readonly columns: Column[] = [
    {
      label: 'Node',
      icon: nodeIcon,
      render: ({ name }) => <Truncate text={name} />
    },
    {
      label: 'Validator',
      icon: nodeValidatorIcon,
      width: 26,
      setting: 'validator',
      render: ({ validator }) => {
        return validator ? <span className="Node-Row-validator" title={validator}><Identicon id={validator} size={16} /></span> : '-';
      }
    },
    {
      label: 'Location',
      icon: nodeLocationIcon,
      width: 140,
      setting: 'location',
      render: ({ city }) => city ? <Truncate text={city} /> : '-'
    },
    {
      label: 'Implementation',
      icon: nodeTypeIcon,
      width: 90,
      setting: 'implementation',
      render: ({ implementation, version }) => {
        const [semver] = version.match(SEMVER_PATTERN) || [version];
        const implIcon = implementation === 'parity-polkadot' ? parityPolkadotIcon
                       : implementation === 'substrate-node' ? paritySubstrateIcon
                       : unknownImplementationIcon;

        return <span title={`${implementation} v${version}`}><Icon src={implIcon} /> {semver}</span>;
      }
    },
    {
      label: 'Peer Count',
      icon: peersIcon,
      width: 26,
      setting: 'peers',
      render: ({ peers }) => `${peers}`
    },
    {
      label: 'Transactions in Queue',
      icon: transactionsIcon,
      width: 26,
      setting: 'txs',
      render: ({ txs }) => `${txs}`
    },
    {
      label: '% CPU Use',
      icon: cpuIcon,
      width: 26,
      setting: 'cpu',
      render: ({ cpu }) => cpu ? `${cpu.toFixed(1)}%` : '-'
    },
    {
      label: 'Memory Use',
      icon: memoryIcon,
      width: 26,
      setting: 'mem',
      render: ({ mem }) => mem ? <span title={`${mem}kb`}>{mem / 1024 | 0}mb</span> : '-'
    },
    {
      label: 'Block',
      icon: blockIcon,
      width: 88,
      setting: 'blocknumber',
      render: ({ height }) => `#${formatNumber(height)}`
    },
    {
      label: 'Block Hash',
      icon: blockHashIcon,
      width: 154,
      setting: 'blockhash',
      render: ({ hash }) => <Truncate text={hash} />
    },
    {
      label: 'Block Time',
      icon: blockTimeIcon,
      width: 80,
      setting: 'blocktime',
      render: ({ blockTime }) => `${secondsWithPrecision(blockTime/1000)}`
    },
    {
      label: 'Block Propagation Time',
      icon: propagationTimeIcon,
      width: 58,
      setting: 'blockpropagation',
      render: ({ propagationTime }) => propagationTime == null ? '∞' : milliOrSecond(propagationTime)
    },
    {
      label: 'Last Block Time',
      icon: lastTimeIcon,
      width: 100,
      setting: 'blocklasttime',
      render: ({ blockTimestamp }) => <Ago when={blockTimestamp} />
    },
  ];

  public static Header = (props: HeaderProps) => {
    const { settings } = props;

    return (
      <thead>
        <tr className="Node-Row-Header">
          {
            Row.columns
              .filter(({ setting }) => setting == null || settings[setting])
              .map(({ icon, width, label }, index) => (
                <th key={index} style={width ? { width } : undefined}><Icon src={icon} alt={label} /></th>
              ))
          }
        </tr>
      </thead>
    )
  }

  public render() {
    const { node, settings } = this.props;

    let className = 'Node-Row';

    if (node.propagationTime != null) {
      className += ' Node-Row-synced';
    }

    if (node.pinned) {
      className += ' Node-Row-pinned';
    }

    return (
      <tr className={className} onClick={this.toggle}>
        {
          Row.columns
            .filter(({ setting }) => setting == null || settings[setting])
            .map(({ render }, index) => <td key={index}>{render(node)}</td>)
        }
      </tr>
    );
  }

  public toggle = () => {
    const { pins, node } = this.props;

    if (node.pinned) {
      pins.delete(node.name)
    } else {
      pins.add(node.name);
    }
  }
}
