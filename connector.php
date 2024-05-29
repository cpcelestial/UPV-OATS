<?php

    $database= new mysqli("localhost","root","","upv-ocs");
    if ($database->connect_error){
        die("Connection failed:  ".$database->connect_error);
    }

?>
