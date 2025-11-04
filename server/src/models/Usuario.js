import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';
import bcrypt from 'bcrypt';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  privacyConsentTimestamp: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Fecha y hora en que el usuario otorgó su consentimiento para el tratamiento de datos personales (ISO 8601)'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Método para validar contraseña
Usuario.prototype.validarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default Usuario;