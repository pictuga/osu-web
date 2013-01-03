<?php
define('ROOT', $_SERVER['DOCUMENT_ROOT']);

function connect()
{
	$root =  "http://osu.ppy.sh";
	$ckfile = "cookie_osu";

	//on récupère le sid sur la page d'accueil
		$url = $root . '/forum/ucp.php?mode=login';
	
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		curl_close($ch);
		
		$dom = new DOMDocument();
		@$dom->loadHTML($file_contents);
		$xpath = new DOMXPath($dom);
		
		if($xpath->query("//input[@name='sid']")->length == 0)
			return true;
		
		$sid = $xpath->query("//input[@name='sid']")->item(0)->getAttribute('value');
		
	//on se connecte
		$url = $root . '/forum/ucp.php?mode=login';

		$data_array = array('username' => '*',
			'password' => '*',
			'redirect' => '/',
			'autologin' => false,
			'login' => 'login',
			'sid' => $sid);
		$data = http_build_query($data_array);		

		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_POST, true);
		curl_setopt ($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		curl_close($ch);
}

function listRanked()
{
	$root =  "http://osu.ppy.sh";
	$ckfile = "cookie_osu";

	//on liste les ranked
		$url = $root . "/p/beatmaplist&s=4&r=0";
	
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		curl_close($ch);
	
		//preg_match_all("#<a href='/s/(\d+?)'>#", $file_contents, $match_array);
		
		preg_match_all("#<td onclick='load\((\d+)\)' class='block'>(<div class='(video)icon'>|<a href)#", $file_contents, $match_array);
		$maps_ranked = array_combine($match_array[1], $match_array[3]);
		
		foreach($maps_ranked as $id_map => $vid)
		{
			$return[] = ($vid == 'video')? $id_map . "n" : $id_map;
		}
		
	return $return;
}

function getOSZ($id)
{
	$osz = downloadOSZ($id);
	if($osz === true)
		unzip(ROOT . '/ddl/' . $id . '.osz', ROOT . '/ddl/' . $id . '/');
	else	echo $osz . 'sec';
}

function downloadOSZ($id)
{
	$root =  "http://osu.ppy.sh";
	$ckfile = "cookie_osu";
	$dest_file = ROOT . '/ddl/' . $id . '.osz';

	//on dl la 1° beatmap
		$url = $root . "/d/" . $id;
		
		//echo $url;
		
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		//curl_setopt ($ch, CURLOPT_HEADER, 1);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt ($ch, CURLOPT_HEADER, true);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		$file_errors   = curl_error($ch);
		$file_headers  = curl_getinfo($ch);
		curl_close($ch);
		
		/*echo '<pre>';
		print_r($file_headers);
		print_r($file_errors);
		echo '</pre>';*/
		
		list($header, $file_contents) = explode("\r\n\r\n", $file_contents, 2);
		
		if($file_headers['http_code'] == 200)
		{
			if($file_headers['content_type'] == 'application/download')
			{
				file_put_contents($dest_file, $file_contents);
				return true;
			}
			
			else
			{
				$dom = new DOMDocument();
				@$dom->loadHTML($content);
				$time = $dom->getElementById('seconds')->nodeValue;
				return $time;
			}
		}
		
		elseif($file_headers['http_code'] == 302)
		{
			preg_match('/(Location:|URI:)(.*?)\n/', $header, $matches);
			$url = trim(array_pop($matches));
			//$url_parsed = parse_url($url);
			
			//on dl le zip
				$ch = curl_init();
				curl_setopt ($ch, CURLOPT_URL, $url);
				curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
				curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
				curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
				$file_contents = curl_exec($ch);
				curl_close($ch);
			
			//on met en cache
				file_put_contents($dest_file, $file_contents);
				
			return true;
		}
}

function downloadOSU($id)
{
	$root =  "http://osu.ppy.sh";
	$ckfile = "cookie_osu";

	//on dl la 1° beatmap
		$url = $root . "/s/" . $id;
	
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		curl_close($ch);
		
		preg_match_all('#<a href="(/web/maps/(.*)\[.+?\]\.osu)">Grab latest .osu file</a>#', $file_contents, $osu_file_url_array);
		preg_match_all("#href='/b/(\d+)'>(.+?)</a>#", $file_contents, $osu_level_array);
	
		$osu_file_url = $osu_file_url_array[2][0];
		$osu_level = $osu_level_array[2][0];
		
	//on récupère le fichire osu
		$url = $root . "/web/maps/" . str_replace(' ', '%20', $osu_file_url) . "[" . str_replace(' ', '%20', $osu_level) . "].osu";
		
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_COOKIEFILE, $ckfile);
		curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$file_contents = curl_exec($ch);
		curl_close($ch);
	
		$osu_file = $file_contents;
	
		return $osu_file;
}

function unzip($file, $dest)
{
	$zip = new ZipArchive;
	if ($zip->open($file) === true)
	{
		$zip->extractTo($dest);
		$zip->close();
		return true;
	}
	else
	{
		return false;
	}
}
?>
