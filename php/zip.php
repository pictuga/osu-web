<?php

function unzip($zip_file)
{
	$zip_file = zip_open($zip_file);
	
	if ($zip_file)
	{
		while ($zip_entry = zip_read($zip_file))
		{
			$name = zip_entry_name($zip_entry);
				$ext = substr($name,strrpos($name,'.')+1);
			$size = zip_entry_filesize($zip_entry);
			$csize = zip_entry_compressedsize($zip_entry);
			$method = zip_entry_compressionmethod($zip_entry);

			if (zip_entry_open($zip_file, $zip_entry, "r"))
			{
				$buf = zip_entry_read($zip_entry, zip_entry_filesize($zip_entry));
				zip_entry_close($zip_entry);
			}
			
			$zip[]  = array('info' => array('name' => $name,
						'ext' => $ext,
						'actual_filesize' => $size,
						'compressed_size' => $csize,
						'compression_method' => $method),
					'content' => $buf);
		}

		zip_close($zip_file);
		
		return $zip;
	}
	
	else
	{
		return false;
	}
}
?>
