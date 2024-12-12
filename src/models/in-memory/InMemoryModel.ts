import { DataTypes, Sequelize } from 'sequelize';
import webAuthnRegisterOptions from './WebAuthnRegisterOption';
import webAuthnLoginOptions from './WebAuthnLoginOption';
import TotpSecret from './TotpSecret';

export type InMemoryModel = {
  webAuthnRegisterOption: ReturnType<typeof webAuthnRegisterOptions>;
  webAuthnLoginOption: ReturnType<typeof webAuthnLoginOptions>;
  totpSecret: ReturnType<typeof TotpSecret>;
  dataTypes: typeof DataTypes;
  sequelize: Sequelize;
};

function inMemoryModel() {
  const sequelize = new Sequelize({
    database: 'temp',
    dialect: 'sqlite',
    storage: ':memory:',
    pool: { max: 1, idle: 60000, maxUses: 1 },
    logging: false
  });

  const models: InMemoryModel = {
    webAuthnRegisterOption: webAuthnRegisterOptions(sequelize, DataTypes),
    webAuthnLoginOption: webAuthnLoginOptions(sequelize, DataTypes),
    totpSecret: TotpSecret(sequelize, DataTypes),
    dataTypes: DataTypes,
    sequelize
  };
  models.sequelize.sync();
  Object.values(models).forEach((model) => {
    if ('associate' in model) {
      model.associate(models);
    }
  });

  return models;
}

export default inMemoryModel;
