<?php
function listContent($folder, $extension)
{
	$dir = $_SERVER['DOCUMENT_ROOT'] . $folder;

	if (is_dir($dir))
	{
		if ($dh = opendir($dir))
		{
			while (($file = readdir($dh)) !== false)
			{
				$file_info = pathinfo($dir . $file);
				if(filetype($dir . $file) == "file" AND $file_info['extension'] == $extension)
				{
					$file_array[] = $file_info['filename'];
				}
			}
			closedir($dh);
		}
	}

	return $file_array;
}
?>
