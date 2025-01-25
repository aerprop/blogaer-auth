import { DataTypes, Sequelize } from 'sequelize';
import WebAuthnRegisterOptions from './WebAuthnRegisterOption';
import WebAuthnLoginOptions from './WebAuthnLoginOption';
import TotpSecret from './TotpSecret';

export type InMemoryModel = {
  webAuthnRegisterOption: ReturnType<typeof WebAuthnRegisterOptions>;
  webAuthnLoginOption: ReturnType<typeof WebAuthnLoginOptions>;
  totpSecret: ReturnType<typeof TotpSecret>;
  dataTypes: typeof DataTypes;
  sequelize: Sequelize;
};

let InMemoryModel: InMemoryModel | null = null;

async function init() {
  const sequelize = new Sequelize({
    database: 'temp',
    dialect: 'sqlite',
    storage: ':memory:',
    pool: { max: 1, idle: 60000, maxUses: Infinity },
    logging: false
  });
  try {
    InMemoryModel = {
      webAuthnRegisterOption: WebAuthnRegisterOptions(sequelize, DataTypes),
      webAuthnLoginOption: WebAuthnLoginOptions(sequelize, DataTypes),
      totpSecret: TotpSecret(sequelize, DataTypes),
      dataTypes: DataTypes,
      sequelize
    };
    await InMemoryModel.sequelize.sync({ force: true });
    Object.values(InMemoryModel).forEach((model) => {
      if ('associate' in model && InMemoryModel) {
        model.associate(InMemoryModel);
      }
    });
  } catch (error) {
    console.error('Error initializing in-memory database:', error);
  }
}

async function getInMemoryModel() {
  if (!InMemoryModel) await init();

  return InMemoryModel;
}

export default getInMemoryModel;
