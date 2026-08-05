import prisma from '../config/prisma';

export class ReportRecipientService {
  private async getOrCreateAppSettingId() {
    let setting = await prisma.appSetting.findFirst();
    if (!setting) {
      setting = await prisma.appSetting.create({
        data: { store_name: 'Kopi Wara' },
      });
    }
    return setting.id;
  }

  async getAll() {
    return prisma.reportRecipient.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: any) {
    const app_setting_id = await this.getOrCreateAppSettingId();
    return prisma.reportRecipient.create({
      data: {
        app_setting_id,
        name: data.name,
        phone: data.phone,
        report_type: data.report_type,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.reportRecipient.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        report_type: data.report_type,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });
  }

  async delete(id: string) {
    return prisma.reportRecipient.delete({
      where: { id },
    });
  }
}
export default ReportRecipientService;
