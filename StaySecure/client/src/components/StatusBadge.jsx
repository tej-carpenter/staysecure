import React from 'react';
import { getStatusColor } from '../utils/helpers';

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
