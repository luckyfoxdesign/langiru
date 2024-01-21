<?
include $_SERVER["DOCUMENT_ROOT"]."/connect.php";


$x=0;
while ($x++<3) {
$xmlfile = "sitemap-$x.xml";
$pagin=($x - 1) * 50000;

// this variable will contain the XML sitemap that will be saved in $xmlfile
$xmlsitemap = '<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';



  // Define and perform the SQL SELECT query
  $sql = mysql_query("SELECT DISTINCT rutext, url       
FROM text
WHERE upd = '1' LIMIT $pagin,50000");


  $result = mysql_num_rows($sql);

  // If the SQL query is succesfully performed ($result not false)
  if($result !== false) {
    // Parse the result set, and add the URL in the XML structure
    while($row = mysql_fetch_array($sql)){
       $col_url = "https://langi.ru/".$row['url']."-na-anglijskom-perevod-primery";
        
        
        
      $xmlsitemap .= '<url>
<loc>'. $col_url .'</loc>
<priority>0.5</priority>
<changefreq>weekly</changefreq>
</url>';
    }
  }

  $conn = null;        // Disconnect


$xmlsitemap .= '</urlset>';
file_put_contents($_SERVER["DOCUMENT_ROOT"]."/sitemap/$xmlfile", $xmlsitemap);          // saves the sitemap on server

// outputs the sitemap (delete this instruction if you not want to display the sitemap in browser)
//echo $xmlsitemap;
}