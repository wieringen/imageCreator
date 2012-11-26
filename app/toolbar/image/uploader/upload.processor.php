<?php  

// filename: upload.processor.php

// first let's set some variables

// make a note of the current working directory, relative to root.
$directory_self = str_replace(basename($_SERVER['PHP_SELF']), '', $_SERVER['PHP_SELF']);

// make a note of the directory that will recieve the uploaded files
$uploadsDirectory = $_SERVER['DOCUMENT_ROOT'] . $directory_self . 'uploaded_files/';

// make a note of the location of the upload form in case we need it
$uploadForm = 'http://' . $_SERVER['HTTP_HOST'] . $directory_self . 'upload.form.php';

// name of the fieldname used for the file in the HTML form
$fieldname = 'inputImageUpload';

// Now let's deal with the upload

// possible PHP upload errors
$errors = array(1 => 'php.ini max file size exceeded', 
                2 => 'html form max file size exceeded', 
                3 => 'file upload was only partial', 
                4 => 'no file was attached');

// check for standard uploading errors
($_FILES[$fieldname]['error'] == 0)
	or error($errors[$_FILES[$fieldname]['error']], $uploadForm);
	
// check that the file we are working on really was an HTTP upload
@is_uploaded_file($_FILES[$fieldname]['tmp_name'])
	or error('not an HTTP upload', $uploadForm);
	
// validation... since this is an image upload script we 
// should run a check to make sure the upload is an image
@getimagesize($_FILES[$fieldname]['tmp_name'])
	or error('only image uploads are allowed', $uploadForm);
	
// make a unique filename for the uploaded file and check it is 
// not taken... if it is keep trying until we find a vacant one
$now = time();
while(file_exists($uploadFilename = $uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name']))
{
	$now++;
}

// now let's move the file to its final and allocate it with the new filename
@move_uploaded_file($_FILES[$fieldname]['tmp_name'], $uploadFilename)
	or error('receiving directory insuffiecient permission', $uploadForm);

// *** Include the class
include("resize-class.php");
// *** 1) Initialize / load image
$resizeObj = new resize($uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name']);
// *** 2) Resize image (options: exact, portrait, landscape, auto, crop)
$resizeObj -> resizeImage(320, 240, 'crop');
// *** 3) Save image
$resizeObj -> saveImage($uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name'], 100);

// If you got this far, everything has worked and the file has been successfully saved.
header('content-type: application/json; charset=utf-8');
echo json_encode( array( "src" => "toolbar/image/uploader/uploaded_files/" .$now.'-'.$_FILES[$fieldname]['name'] ) );

// make an error handler which will be used if the upload fails
function error($error, $location, $seconds = 5)
{
	header("Refresh: $seconds; URL=\"$location\"");
	echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"'."\n".
	'"http://www.w3.org/TR/html4/strict.dtd">'."\n\n".
	'<html lang="en">'."\n".
	'	<head>'."\n".
	'		<meta http-equiv="content-type" content="text/html; charset=iso-8859-1">'."\n\n".
	'		<link rel="stylesheet" type="text/css" href="stylesheet.css">'."\n\n".
	'	<title>Upload error</title>'."\n\n".
	'	</head>'."\n\n".
	'	<body>'."\n\n".
	'	<div id="Upload">'."\n\n".
	'		<h1>Upload failure</h1>'."\n\n".
	'		<p>An error has occured: '."\n\n".
	'		<span class="red">' . $error . '...</span>'."\n\n".
	'	 	The upload form is reloading</p>'."\n\n".
	'	 </div>'."\n\n".
	'</html>';
	exit;
} // end error handler

?>