// The Refactor code is below:

  type WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // Added blockchain property to WalletBalance
  }
  
  type FormattedWalletBalance = WalletBalance & {
    formatted: string;
  }
  
  type Props = BoxProps & {};
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    // Use children if needed
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
    const getPriority = (blockchain: string): number => {
      switch (blockchain) {
        case 'Osmosis':
          return 100;
        case 'Ethereum':
          return 50;
        case 'Arbitrum':
          return 30;
        case 'Zilliqa':
          return 20;
        case 'Neo':
          return 20;
        default:
          return -99;
      }
    };
  
    const sortedBalances = useMemo(() => {
      return balances
        .filter((balance: WalletBalance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          const leftPriority = getPriority(lhs.blockchain);
          const rightPriority = getPriority(rhs.blockchain);
          
          // Complete sort logic
          if (leftPriority > rightPriority) {
            return -1;
          } else if (rightPriority > leftPriority) {
            return 1;
          }
          return 0; // Equal priorities
        })
        .map((balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed()
        }));
        
    }, [balances, prices]); // Update dependencies
  
  // Memoize rows generation
  const rows = useMemo(() => {
    return sortedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow 
          className={classes.row}
          key={balance.currency + balance.amount} // Assuming currency is unique for each balance
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [sortedBalances, prices]); 
  
    return (
      <div {...rest}>
        {rows}
        {children} {/* Use children if needed */}
      </div>
    );
  };
  
