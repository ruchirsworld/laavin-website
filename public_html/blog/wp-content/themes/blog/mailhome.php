<?php
error_reporting(0);
session_start();
if(isset($_REQUEST['name']))
{
  

echo"hello wp-content themes blog";
die();

 $namef=$_POST['name'];
 $phone=$_POST['phone'];
 $from = $email=$_POST['email'];
 $country=$_POST['country'];
 $fsubject=$_POST['msg_subject'];


 

			

     $from_email         = 'info@writospark.com'; //from mail, sender email address
    $recipient_email = 'writospark1@gmail.com'; //recipient email address
     
    //Load POST data from HTML form
    $sender_name = $_POST["name"]; //sender name
    $reply_to_email = $_POST["email"]; //sender email, it will be used in "reply-to" header
 
              

    /*Always remember to validate the form fields like this
    if(strlen($sender_name)<1)
    {
        die('Name is too short or empty!');
    }
    */   
    //Get uploaded file data using $_FILES array
    $tmp_name = $_FILES['file']['tmp_name']; // get the temporary file name of the file on the server
    $name     = $_FILES['file']['name']; // get the name of the file
    $size     = $_FILES['file']['size']; // get size of the file for size validation
    $type     = $_FILES['file']['type']; // get type of the file
    $error     = $_FILES['file']['error']; // get the error (if any)
 

 
    //read from the uploaded file & base64_encode content
    $handle = fopen($tmp_name, "r"); // set the file handle only for reading the file
    $content = fread($handle, $size); // reading the file
    fclose($handle);                 // close upon completion
 
    $encoded_content = chunk_split(base64_encode($content));
    $boundary = md5("random"); // define boundary with a md5 hashed value
    
    
        //Get uploaded file data using $_FILES array
    $tmp_name1 = $_FILES['file2']['tmp_name']; // get the temporary file name of the file on the server
    $name1     = $_FILES['file2']['name']; // get the name of the file
    $size1     = $_FILES['file2']['size']; // get size of the file for size validation
    $type1     = $_FILES['file2']['type']; // get type of the file
    $error1     = $_FILES['file2']['error']; // get the error (if any)
 
 
 
    //read from the uploaded file & base64_encode content
    $handle1 = fopen($tmp_name1, "r"); // set the file handle only for reading the file
    $content1 = fread($handle1, $size1); // reading the file
    fclose($handle1);                 // close upon completion
 
    $encoded_content1 = chunk_split(base64_encode($content1));
    $boundary1 = md5("random"); // define boundary with a md5 hashed value
    
 
    //header
    $headers = "MIME-Version: 1.0\r\n"; // Defining the MIME version
    $headers .= "From:".$from_email."\r\n"; // Sender Email
    $headers .= "Reply-To: ".$reply_to_email."\r\n"; // Email address to reach back
    $headers .= "Content-Type: multipart/mixed;"; // Defining Content-Type
    $headers .= "boundary = $boundary\r\n"; //Defining the Boundary
     
     
          $contents  = "<img src='http://writospark.com/images/logo.png' style='width:100px;' alt='writospark'/><br><br>" ;
        $contents .= "<table style='width:700px;padding:10px;'><tr><td style='width:20px;border:1px solid #ccc;padding:10px;'><strong>Name:</strong></td><td style='width:200px;border:1px solid #ccc;padding:10px;'>" . $namef."</td></tr>";

		$contents .= "<tr><td style='width:20px;border:1px solid #ccc;padding:10px;'><strong>Email:</strong></td><td style='width:200px;border:1px solid #ccc;padding:10px;'>" . $email . "</td></tr>";
		$contents .= "<tr><td style='width:20px;border:1px solid #ccc;padding:10px;'><strong>Phone:</strong></td><td style='width:200px;border:1px solid #ccc;padding:10px;'>" . $phone. "</td></tr>";
		$contents .= "<tr><td style='width:20px;border:1px solid #ccc;padding:10px;'><strong>Country:</strong></td><td style='width:200px;border:1px solid #ccc;padding:10px;'>" . $country . "</td></tr>";
       	$contents .= "<tr><td style='width:20px;border:1px solid #ccc;padding:10px;'><strong>Subject:</strong></td><td style='width:200px;border:1px solid #ccc;padding:10px;'>" . $fsubject . "</td></tr>";
       
        $contents .="</table>";
          
     

  
    //plain text
    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($contents));
         
    //attachment
    $body .= "--$boundary\r\n";
    $body .="Content-Type: $type; name=".$name."\r\n";
    $body .="Content-Disposition: attachment; filename=".$name."\r\n";
    $body .="Content-Transfer-Encoding: base64\r\n";
    $body .="X-Attachment-Id: ".rand(1000, 99999)."\r\n\r\n";
    $body .= $encoded_content; // Attaching the encoded file with email
    
    
     //attachment
    $body .= "--$boundary1\r\n";
    $body .="Content-Type: $type1; name=".$name1."\r\n";
    $body .="Content-Disposition: attachment; filename=".$name1."\r\n";
    $body .="Content-Transfer-Encoding: base64\r\n";
    $body .="X-Attachment-Id: ".rand(1000, 99999)."\r\n\r\n";
    $body .= $encoded_content1; // Attaching the encoded file with email
     
    $sentMailResult = mail($recipient_email, $fsubject, $body, $headers);

    if($sentMailResult )
    {
       echo "<script type='text/javascript'>" .
			
				"window.location.href='thankyou.html';" .
				"</script>";
    }
    else
    {
  
         echo "<script type='text/javascript'>" .
			
				"window.location.href='thankyou.html';" .
				"</script>";
    }
		
}

?>