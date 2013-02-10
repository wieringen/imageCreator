<?php  

// filename: upload.processor.php

// first let's set some variables

// make a note of the current working directory, relative to root.
$directory_self = str_replace(basename($_SERVER['PHP_SELF']), '', $_SERVER['PHP_SELF']);

// make a note of the directory that will recieve the uploaded files
$uploadsDirectory = $_SERVER['DOCUMENT_ROOT'] . $directory_self . 'uploads/';

// name of the fieldname used for the file in the HTML form
$fieldname = 'inputImageUpload';

// Now let's deal with the upload

// possible PHP upload errors
$errors = array(1 => 'Error uploading image: php.ini max file size exceeded', 
                2 => 'Error uploading image: Html form max file size exceeded', 
                3 => 'Error uploading image: File upload was only partial', 
                4 => 'Error uploading image: No file was attached');

// check for PHP's built-in uploading errors 
($_FILES[$fieldname]['error'] == 0) 
    or error( $errors[$_FILES[$fieldname]['error']] ); 

// check that the file we are working on really was an HTTP upload
@is_uploaded_file($_FILES[$fieldname]['tmp_name'])
	or error('Error uploading image: Not an HTTP upload');
	
// validation... since this is an image upload script we 
// should run a check to make sure the upload is an image
@getimagesize($_FILES[$fieldname]['tmp_name'])
	or error('Error uploading image: Only image uploads are allowed');
	
// make a unique filename for the uploaded file and check it is 
// not taken... if it is keep trying until we find a vacant one
$now = time();
while(file_exists($uploadFilename = $uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name']))
{
	$now++;
}

// now let's move the file to its final and allocate it with the new filename
@move_uploaded_file($_FILES[$fieldname]['tmp_name'], $uploadFilename)
	or error('Error uploading image: Receiving directory has insuffiecient permission');

// *** Include the class
include("resize-class.php");
// *** 1) Initialize / load image
$resizeObj = new resize($uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name']);
// *** 2) Resize image (options: exact, portrait, landscape, auto, crop)
$resizeObj -> resizeImage(550, 550);
// *** 3) Save image
$resizeObj -> saveImage($uploadsDirectory.$now.'-'.$_FILES[$fieldname]['name'], 100);

// If you got this far, everything has worked and the file has been successfully saved.
header('content-type: text/html');
echo json_encode( array( "code" => 200, "message" => "Image uploaded succesfully.", "src" => "temp/uploads/" .$now.'-'.$_FILES[$fieldname]['name'] ) );

// make an error handler which will be used if the upload fails
function error( $error )
{
	header('content-type: text/html');
	echo json_encode( array( "message" => $error ) );
	exit;
}

?>