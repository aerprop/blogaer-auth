import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server/script/deps';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { InMemoryModel } from './InMemoryModel';

interface WebAuthnLoginOptionModel {
  id?: number;
  userId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
  createdAt?: string;
  updatedAt?: string;
}

interface WebAuthnLoginOption
  extends Model<WebAuthnLoginOptionModel>,
    WebAuthnLoginOptionModel {}

export type WebAuthnLoginOptionStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): WebAuthnLoginOption;
  associate: (model: InMemoryModel) => void;
};

function webAuthnLoginOption(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
) {
  const webAuthnLoginOption = sequelize.define<WebAuthnLoginOption>(
    'WebAuthnLoginOption',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        type: dataTypes.INTEGER
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      },
      options: {
        allowNull: false,
        type: dataTypes.JSON
      },
      createdAt: {
        type: dataTypes.DATE
      },
      updatedAt: {
        type: dataTypes.DATE
      }
    },
    {
      tableName: 'login_options',
      underscored: true
    }
  ) as WebAuthnLoginOptionStatic;

  return webAuthnLoginOption;
}

export default webAuthnLoginOption;
