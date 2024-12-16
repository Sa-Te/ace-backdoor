"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Visitors", [
      {
        url: "mypage1.com",
        ip: "192.168.1.1",
        timestamp: new Date(),
        uniqueVisit: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        url: "mypage2.com",
        ip: "192.168.1.2",
        timestamp: new Date(),
        uniqueVisit: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Visitors", null, {});
  },
};
