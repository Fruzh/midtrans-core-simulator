const PROXY_URL = '/charge';
const STATUS_URL = '/status';

const MIDTRANS_SIMULATOR_URL = 'https://simulator.sandbox.midtrans.com';

const SIMULATOR_MAP = {
    'bca': `${MIDTRANS_SIMULATOR_URL}/bca/va/index`,
    'bni': `${MIDTRANS_SIMULATOR_URL}/bni/va/index`,
    'bri': `${MIDTRANS_SIMULATOR_URL}/openapi/va/index?bank=bri`,
    'mandiri': `${MIDTRANS_SIMULATOR_URL}/openapi/va/index?bank=mandiri`,
    'permata': `${MIDTRANS_SIMULATOR_URL}/openapi/va/index?bank=permata`,
    'cimb': `${MIDTRANS_SIMULATOR_URL}/openapi/va/index?bank=cimb`,
    'bsi': `${MIDTRANS_SIMULATOR_URL}/openapi/va/index?bank=bsi`,
    'qris': `${MIDTRANS_SIMULATOR_URL}/v2/qris/index`,
    'gopay': `${MIDTRANS_SIMULATOR_URL}/v2/deeplink/detail`,
    'alfamart': `${MIDTRANS_SIMULATOR_URL}/alfamart/index`,
    'indomaret': `${MIDTRANS_SIMULATOR_URL}/indomaret/phoenix/index`,
    'akulaku': `${MIDTRANS_SIMULATOR_URL}/akulaku/ui/login`
};
