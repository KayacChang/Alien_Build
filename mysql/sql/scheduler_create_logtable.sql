USE logdb;

DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `createNewLogTableByDate`(IN tableName varchar(40))
BEGIN
	set @QUERY = concat("CREATE TABLE IF NOT EXISTS `$tableName` LIKE log;");
	set @QUERY = REPLACE(@QUERY, "$tableName", tableName);
	prepare execsql from @QUERY;
	execute execsql;
END ;;

CREATE DEFINER=`root`@`localhost` PROCEDURE `createNewLogTableByDate_EventCall`()
BEGIN
	declare x int;
	SET x = 0;
	while X < 30 do
	CREATE TEMPORARY TABLE IF NOT EXISTS log (          
    `index` bigint(20) NOT NULL AUTO_INCREMENT,
    `Account` varchar(128) NOT NULL,
    `PlayerID` bigint(20) NOT NULL,
    `Time` bigint(20) NOT NULL,
    `ActivityEvent` int(11) NOT NULL,        
    `IValue1` bigint(20) NOT NULL DEFAULT '0',        
    `IValue2` bigint(20) NOT NULL DEFAULT '0',       
    `IValue3` bigint(20) NOT NULL DEFAULT '0',     
    `SValue1` varchar(128) NOT NULL DEFAULT '',       
    `SValue2` varchar(128) NOT NULL DEFAULT '',     
    `SValue3` varchar(128) NOT NULL DEFAULT '',     
    `Msg` text NOT NULL,      
    PRIMARY KEY (`index`) 
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
	CALL createNewLogTableByDate(DATE_FORMAT(ADDDATE(now(), INTERVAL X DAY), '%Y%m%d'));
	SET X = X +1;
	end while;
END ;;

CREATE EVENT `create_logtable` 
ON SCHEDULE 
	EVERY 10 DAY STARTS '2020-07-28 23:36:36' ON COMPLETION NOT PRESERVE ENABLE 
DO 
	call createNewLogTableByDate_EventCall() 
;;
DELIMITER ;