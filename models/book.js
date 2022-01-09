"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please enter a title for the book.",
          },
          notNull: {
            msg: "Please enter a title for the book.",
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please enter an author for the book.",
          },
          notNull: {
            msg: "Please enter an author for the book.",
          },
        },
      },
      genre: { type: DataTypes.STRING },
      year: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            args: true,
            msg: "Please enter the year as a number",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
