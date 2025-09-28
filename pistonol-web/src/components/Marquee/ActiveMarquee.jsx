import React from 'react';
import { Alert } from 'antd';
import { useActiveMarquee } from '../../hooks/useMarquees';

const ActiveMarquee = () => {
  const { data: activeMarquee, isLoading, isError } = useActiveMarquee();

  if (isLoading) return null;
  if (isError || !activeMarquee) return null;

  return (
    <Alert
      message={activeMarquee.text}
      type="info"
      banner
      style={{ 
        textAlign: 'center',
        fontSize: '1.2rem',
        padding: '12px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    />
  );
};

export default ActiveMarquee;