import DMRReportsPopover from '../components/DMRReportsPopover';
import StockReportsPopover from '../components/StockReportsPopover';

const DistributorReportsPopover = ({ isDMR, distributorId, children }) => {
  if (isDMR) {
    return (
      <DMRReportsPopover distributorId={distributorId}>
        {children}
      </DMRReportsPopover>
    );
  } else {
    return (
      <StockReportsPopover distributorId={distributorId}>
        {children}
      </StockReportsPopover>
    );
  }
};

export default DistributorReportsPopover;