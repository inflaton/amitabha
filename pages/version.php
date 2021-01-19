<?php
$API_APP_NAME = "Sandbox";
$SOURCE_VERSION = "unknown";

if (strlen($SOURCE_VERSION) == 7) {
    $SOURCE_VERSION = shell_exec("git rev-parse HEAD");
}

echo "<h2>香光庄严 " . $API_APP_NAME . "</h2>";
echo "Version: " . $SOURCE_VERSION . "<br>";
?>

<?php phpinfo();