import { BrandColors } from './theme';
import { BrandReceipt } from './receipt';
import { logoBase64 } from '../../services/LogoBase64';

export const Branding = {
  appName: 'Kopi Wara',
  company: {
    name: 'Kopi Wara',
    copyright: '© 2026 Kopi Wara',
    supportEmail: 'support@kopiwara.com',
  },
  business: {
    name: 'Kopi Wara',
    address: 'Jl. Yos Sudarso Bajoe',
    phone: '085345777377',
    instagram: 'IG: @kopi_wara',
    website: 'www.kopiwara.com',
    supportPhone: '085345777377',
    taxLabel: 'Pajak (10%)',
  },
  colors: BrandColors,
  assets: {
    logo: require('./assets/logo.png'),
    bwLogo: require('./assets/bw-logo.png'),
    logoBase64: logoBase64,
  },
  receipt: {
    header: 'KOPI WARA',
    footerName: 'Kopi wara :',
    footerTagline: '1% caffeine, 99% kebahagiaan',
    footerThankYou: 'Terima Kasih',
    build(transaction: any): string {
      return BrandReceipt.build(transaction, Branding);
    },
    testReceipt(): string {
      return BrandReceipt.testReceipt(Branding);
    },
    isCenterLine(line: string): boolean {
      return BrandReceipt.isCenterLine(line, Branding);
    }
  }
};

export default Branding;
