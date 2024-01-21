
<?
include "connect.php";
$q = htmlspecialchars($_GET["q"]);


$text = mysql_query("SELECT rutext,url
			FROM text
			WHERE hashru LIKE '".md5($q)."' AND orders = '1'
			LIMIT 10");
		while($row = mysql_fetch_assoc($text)){
		    
		    $searchword = $row['rutext'];
            $data[] = $row;
		    
		    
		}
		
echo json_encode($data);
?>
