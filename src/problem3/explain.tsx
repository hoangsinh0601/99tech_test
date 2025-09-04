// Refactor code and explanation:

// Should using type instead of interface because:
// Cannot declare multiple type with the same name, by not allowing multiple type declarations with the same name, typeScript helps prevent naming conflicts, this ensures that each type alias has a unique and unambiguous definition,  ensures that a type is consistently defined throughout codebase, making the code easier to understand and maintain.
// Missing blockchain property
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  // Children props is declare but not used
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Shouldn't use any type, should use string instead
  // Using the any type in TypeScript should be avoided because it bypasses type checking, increasing the risk of runtime errors and bugs. It reduces code quality and maintainability, obscures intended types, and makes refactoring and debugging harder
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);

        if (lhsPriority > -99) {
          // lhsPriority is undefined have to replace it with balancePriority
          // Should filter out balances with a priority less than -99 and an amount greater than 0. The current implementation filters out balances with a priority less than -99 or an amount less than or equal to 0.
          // This logic create too much scope that no need to be there, should simplify it by using && operator to merge 2 conditions for easier understanding and the code more readable
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Sorting function does not return a value when priorities are equal.
        // There are too much block of code that can be simplified, no need to use if else in this case, should use ternary operator to make the code more readable
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
    // The dependency array of useMemo includes prices, but prices is not actually used inside the memoized function. This causes unnecessary re-computations.
  }, [balances, prices]);

  // The formattedBalances array is created but not used anywhere in the component. This is unnecessary and should be removed.
  // If want to format the formatted in balances, should format them directly in the sortedBalances.map function to avoid creating an unnecessary intermediate array.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          // classes is not defined in the component, but it is used in the WalletRow component. This will cause a runtime error.
          className={classes.row}
          // Using the index as the key in the rows array can lead to issues with performance and component re-renders. A more stable key should be used if available.
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
