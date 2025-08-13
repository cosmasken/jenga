import { useQuery } from '@tanstack/react-query';

interface CoinGeckoPriceResponse {
  bitcoin: {
    usd: number;
  };
}

export function useBtcPrice() {
  return useQuery<number, Error>({
    queryKey: ['btcPrice'],
    queryFn: async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      if (!response.ok) {
        throw new Error('Failed to fetch BTC price');
      }
      const data: CoinGeckoPriceResponse = await response.json();
      return data.bitcoin.usd;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
