$path = "c:\Users\pc\Desktop\Lidareyn_brand\style.css"
$content = Get-Content $path -Raw

# 1. Root variables (Thin Header)
$content = $content -replace '--header-height: \d+px;', '--header-height: 38px;'

# 2. Header Container Fix
$newHeaderContainer = '.header-container {
    max-width: 1920px;
    height: var(--header-height);
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center !important;
    justify-content: space-between !important;
    position: relative;
    box-sizing: border-box;
}'
# Find .header-container block and replace
$content = $content -replace '\.header-container \{[^}]+\}', $newHeaderContainer

# 3. Logo Fix
$newLogo = '.logo {
    display: flex;
    align-items: center !important;
    height: 100%;
}
.logo a {
    font-family: "Poppins", sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #8b7bd8;
    text-decoration: none;
    line-height: 1;
    display: flex;
    align-items: center;
}'
$content = $content -replace '\.logo \{[^}]+\}\s+\.logo a \{[^}]+\}', $newLogo
# Fallback if structure is different
$content = $content -replace '\.logo \{[^}]+\}', $newLogo

# 4. Nav Menu Fix
$newNavMenu = '.nav-menu {
    display: flex;
    align-items: center !important;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
}
.nav-link {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    text-decoration: none;
    height: 100%;
    display: flex;
    align-items: center !important;
    padding: 0 5px;
    white-space: nowrap;
    line-height: 1;
}'
$content = $content -replace '\.nav-menu \{[^}]+\}', $newNavMenu
$content = $content -replace '\.nav-link \{[^}]+\}', $newNavMenu + " (temp)" # Avoid doubling
# Cleaning up my placeholder
$content = $content -replace '\.nav-menu \{[^}]+ \(temp\)', $newNavMenu

# Extra: Icons Fix
$newIcons = '.header-icons {
    display: flex;
    align-items: center !important;
    gap: 12px;
    height: 100%;
}
.icon-btn {
    display: flex;
    align-items: center !important;
    justify-content: center !important;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    gap: 5px;
    color: #333;
}'
$content = $content -replace '\.header-icons \{[^}]+\}', $newIcons
$content = $content -replace '\.icon-btn \{[^}]+\}', $newIcons + " (temp2)"
$content = $content -replace '\.header-icons \{[^}]+ \(temp2\)', $newIcons

[IO.File]::WriteAllText($path, $content)
