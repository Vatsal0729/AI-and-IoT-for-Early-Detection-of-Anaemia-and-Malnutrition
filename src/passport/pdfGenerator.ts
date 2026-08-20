import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { HealthPassport } from '../types';
import { generatePassportHTML } from './passportTemplate';

export async function generateHealthPassportPDF(passport: HealthPassport): Promise<string> {
  try {
    const html = generatePassportHTML(passport);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      width: 595, // A4 width at 72 PPI
      height: 842 // A4 height at 72 PPI
    });
    
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate Health Passport PDF');
  }
}

export async function shareHealthPassport(fileUri: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Health Passport',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw new Error('Failed to share Health Passport');
  }
}

export async function printHealthPassport(html: string): Promise<void> {
  try {
    await Print.printAsync({
      html,
      orientation: Print.Orientation.portrait,
    });
  } catch (error) {
    console.error('Error printing document:', error);
    throw new Error('Failed to print Health Passport');
  }
}
