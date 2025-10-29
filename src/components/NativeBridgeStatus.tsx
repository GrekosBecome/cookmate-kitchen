import { useNativeBridge } from '@/hooks/useNativeBridge';
import { Badge } from '@/components/ui/badge';

export const NativeBridgeStatus = () => {
  const { isNative, isReady, bridge } = useNativeBridge();

  if (!isReady || import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-[9999]">
      <Badge variant={isNative ? "default" : "secondary"}>
        {isNative ? `Native (${bridge?.platform})` : 'Web'}
      </Badge>
    </div>
  );
};
