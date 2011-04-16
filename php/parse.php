<?php

function parseOSU($osu_content)
{
	preg_match_all('#\[(\w*?)\]\s+(.*?)(?:\n\r|\Z)#s', $osu_content, $match);
	
	if(!empty($match[2][0]) AND  !empty($match[2]) AND $match[2] != NULL)
	{
		$match = array_combine($match[1], $match[2]);
	
		foreach($match as $cat => $cat_values)
		{
			preg_match_all('#(?:(?:\n|\A))((\w+?) ?: ?(.*?)|.+?)(?=((\r|\n)+|\Z))#', $cat_values, $values_array);
		
			if(!empty($values_array[0][0]) AND !empty($values_array[2][0])) $temp = array_combine($values_array[2], $values_array[3]);
			elseif(!empty($values_array[0][0])) $temp = $values_array[1];
			
			$return_array[$cat] = $temp;
		}
	}
	
	return $return_array;
}
?>
