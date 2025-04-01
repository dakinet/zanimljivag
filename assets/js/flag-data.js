// Country flags data object 
// Maps country codes to country names
const flagsData = {
    'AF': { name: 'Avganistan', code: 'AF' },
    'AL': { name: 'Albanija', code: 'AL' },
    'DZ': { name: 'Alžir', code: 'DZ' },
    'AD': { name: 'Andora', code: 'AD' },
    'AO': { name: 'Angola', code: 'AO' },
    'AR': { name: 'Argentina', code: 'AR' },
    'AM': { name: 'Armenija', code: 'AM' },
    'AU': { name: 'Australija', code: 'AU' },
    'AT': { name: 'Austrija', code: 'AT' },
    'AZ': { name: 'Azerbejdžan', code: 'AZ' },
    'BS': { name: 'Bahami', code: 'BS' },
    'BH': { name: 'Bahrein', code: 'BH' },
    'BD': { name: 'Bangladeš', code: 'BD' },
    'BB': { name: 'Barbados', code: 'BB' },
    'BY': { name: 'Belorusija', code: 'BY' },
    'BE': { name: 'Belgija', code: 'BE' },
    'BZ': { name: 'Belize', code: 'BZ' },
    'BJ': { name: 'Benin', code: 'BJ' },
    'BT': { name: 'Butan', code: 'BT' },
    'BO': { name: 'Bolivija', code: 'BO' },
    'BA': { name: 'Bosna i Hercegovina', code: 'BA' },
    'BW': { name: 'Bocvana', code: 'BW' },
    'BR': { name: 'Brazil', code: 'BR' },
    'BN': { name: 'Brunej', code: 'BN' },
    'BG': { name: 'Bugarska', code: 'BG' },
    'BF': { name: 'Burkina Faso', code: 'BF' },
    'BI': { name: 'Burundi', code: 'BI' },
    'KH': { name: 'Kambodža', code: 'KH' },
    'CM': { name: 'Kamerun', code: 'CM' },
    'CA': { name: 'Kanada', code: 'CA' },
    'CV': { name: 'Zelenortska Ostrva', code: 'CV' },
    'CF': { name: 'Centralnoafrička Republika', code: 'CF' },
    'TD': { name: 'Čad', code: 'TD' },
    'CL': { name: 'Čile', code: 'CL' },
    'CN': { name: 'Kina', code: 'CN' },
    'CO': { name: 'Kolumbija', code: 'CO' },
    'KM': { name: 'Komori', code: 'KM' },
    'CG': { name: 'Kongo', code: 'CG' },
    'CD': { name: 'DR Kongo', code: 'CD' },
    'CR': { name: 'Kostarika', code: 'CR' },
    'CI': { name: 'Obala Slonovače', code: 'CI' },
    'HR': { name: 'Hrvatska', code: 'HR' },
    'CU': { name: 'Kuba', code: 'CU' },
    'CY': { name: 'Kipar', code: 'CY' },
    'CZ': { name: 'Češka', code: 'CZ' },
    'DK': { name: 'Danska', code: 'DK' },
    'DJ': { name: 'Džibuti', code: 'DJ' },
    'DM': { name: 'Dominika', code: 'DM' },
    'DO': { name: 'Dominikanska Republika', code: 'DO' },
    'EC': { name: 'Ekvador', code: 'EC' },
    'EG': { name: 'Egipat', code: 'EG' },
    'SV': { name: 'Salvador', code: 'SV' },
    'GQ': { name: 'Ekvatorijalna Gvineja', code: 'GQ' },
    'ER': { name: 'Eritreja', code: 'ER' },
    'EE': { name: 'Estonija', code: 'EE' },
    'ET': { name: 'Etiopija', code: 'ET' },
    'FJ': { name: 'Fidži', code: 'FJ' },
    'FI': { name: 'Finska', code: 'FI' },
    'FR': { name: 'Francuska', code: 'FR' },
    'GA': { name: 'Gabon', code: 'GA' },
    'GM': { name: 'Gambija', code: 'GM' },
    'GE': { name: 'Gruzija', code: 'GE' },
    'DE': { name: 'Nemačka', code: 'DE' },
    'GH': { name: 'Gana', code: 'GH' },
    'GR': { name: 'Grčka', code: 'GR' },
    'GL': { name: 'Grenland', code: 'GL' },
    'GD': { name: 'Grenada', code: 'GD' },
    'GT': { name: 'Gvatemala', code: 'GT' },
    'GN': { name: 'Gvineja', code: 'GN' },
    'GW': { name: 'Gvineja Bisao', code: 'GW' },
    'GY': { name: 'Gvajana', code: 'GY' },
    'HT': { name: 'Haiti', code: 'HT' },
    'HN': { name: 'Honduras', code: 'HN' },
    'HU': { name: 'Mađarska', code: 'HU' },
    'IS': { name: 'Island', code: 'IS' },
    'IN': { name: 'Indija', code: 'IN' },
    'ID': { name: 'Indonezija', code: 'ID' },
    'IR': { name: 'Iran', code: 'IR' },
    'IQ': { name: 'Irak', code: 'IQ' },
    'IE': { name: 'Irska', code: 'IE' },
    'IL': { name: 'Izrael', code: 'IL' },
    'IT': { name: 'Italija', code: 'IT' },
    'JM': { name: 'Jamajka', code: 'JM' },
    'JP': { name: 'Japan', code: 'JP' },
    'JO': { name: 'Jordan', code: 'JO' },
    'KZ': { name: 'Kazahstan', code: 'KZ' },
    'KE': { name: 'Kenija', code: 'KE' },
    'KI': { name: 'Kiribati', code: 'KI' },
    'KR': { name: 'Južna Koreja', code: 'KR' },
    'KW': { name: 'Kuvajt', code: 'KW' },
    'KG': { name: 'Kirgistan', code: 'KG' },
    'LA': { name: 'Laos', code: 'LA' },
    'LV': { name: 'Letonija', code: 'LV' },
    'LB': { name: 'Liban', code: 'LB' },
    'LS': { name: 'Lesoto', code: 'LS' },
    'LR': { name: 'Liberija', code: 'LR' },
    'LY': { name: 'Libija', code: 'LY' },
    'LI': { name: 'Lihtenštajn', code: 'LI' },
    'LT': { name: 'Litvanija', code: 'LT' },
    'LU': { name: 'Luksemburg', code: 'LU' },
    'MK': { name: 'Severna Makedonija', code: 'MK' },
    'MG': { name: 'Madagaskar', code: 'MG' },
    'MW': { name: 'Malavi', code: 'MW' },
    'MY': { name: 'Malezija', code: 'MY' },
    'MV': { name: 'Maldivi', code: 'MV' },
    'ML': { name: 'Mali', code: 'ML' },
    'MT': { name: 'Malta', code: 'MT' },
    'MH': { name: 'Maršalska Ostrva', code: 'MH' },
    'MR': { name: 'Mauritanija', code: 'MR' },
    'MU': { name: 'Mauricijus', code: 'MU' },
    'MX': { name: 'Meksiko', code: 'MX' },
    'FM': { name: 'Mikronezija', code: 'FM' },
    'MD': { name: 'Moldavija', code: 'MD' },
    'MC': { name: 'Monako', code: 'MC' },
    'MN': { name: 'Mongolija', code: 'MN' },
    'ME': { name: 'Crna Gora', code: 'ME' },
    'MA': { name: 'Maroko', code: 'MA' },
    'MZ': { name: 'Mozambik', code: 'MZ' },
    'MM': { name: 'Mjanmar (Burma)', code: 'MM' },
    'NA': { name: 'Namibija', code: 'NA' },
    'NR': { name: 'Nauru', code: 'NR' },
    'NP': { name: 'Nepal', code: 'NP' },
    'NL': { name: 'Holandija', code: 'NL' },
    'NZ': { name: 'Novi Zeland', code: 'NZ' },
    'NI': { name: 'Nikaragva', code: 'NI' },
    'NE': { name: 'Niger', code: 'NE' },
    'NG': { name: 'Nigerija', code: 'NG' },
    'NO': { name: 'Norveška', code: 'NO' },
    'OM': { name: 'Oman', code: 'OM' },
    'PK': { name: 'Pakistan', code: 'PK' },
    'PW': { name: 'Palau', code: 'PW' },
    'PA': { name: 'Panama', code: 'PA' },
    'PG': { name: 'Papua Nova Gvineja', code: 'PG' },
    'PY': { name: 'Paragvaj', code: 'PY' },
    'PE': { name: 'Peru', code: 'PE' },
    'PH': { name: 'Filipini', code: 'PH' },
    'PL': { name: 'Poljska', code: 'PL' },
    'PT': { name: 'Portugal', code: 'PT' },
    'QA': { name: 'Katar', code: 'QA' },
    'RO': { name: 'Rumunija', code: 'RO' },
    'RU': { name: 'Rusija', code: 'RU' },
    'RW': { name: 'Ruanda', code: 'RW' },
    'KN': { name: 'Sveti Kits i Nevis', code: 'KN' },
    'LC': { name: 'Sveta Lucija', code: 'LC' },
    'VC': { name: 'Sveti Vinsent i Grenadini', code: 'VC' },
    'WS': { name: 'Samoa', code: 'WS' },
    'SM': { name: 'San Marino', code: 'SM' },
    'ST': { name: 'Sao Tome i Principe', code: 'ST' },
    'SA': { name: 'Saudijska Arabija', code: 'SA' },
    'SN': { name: 'Senegal', code: 'SN' },
    'RS': { name: 'Srbija', code: 'RS' },
    'SC': { name: 'Sejšeli', code: 'SC' },
    'SL': { name: 'Sijera Leone', code: 'SL' },
    'SG': { name: 'Singapur', code: 'SG' },
    'SK': { name: 'Slovačka', code: 'SK' },
    'SI': { name: 'Slovenija', code: 'SI' },
    'SB': { name: 'Solomonska Ostrva', code: 'SB' },
    'SO': { name: 'Somalija', code: 'SO' },
    'ZA': { name: 'Južnoafrička Republika', code: 'ZA' },
    'ES': { name: 'Španija', code: 'ES' },
    'LK': { name: 'Šri Lanka', code: 'LK' },
    'SD': { name: 'Sudan', code: 'SD' },
    'SR': { name: 'Surinam', code: 'SR' },
    'SZ': { name: 'Svazilend', code: 'SZ' },
    'SE': { name: 'Švedska', code: 'SE' },
    'CH': { name: 'Švajcarska', code: 'CH' },
    'SY': { name: 'Sirija', code: 'SY' },
    'TW': { name: 'Tajvan', code: 'TW' },
    'TJ': { name: 'Tadžikistan', code: 'TJ' },
    'TZ': { name: 'Tanzanija', code: 'TZ' },
    'TH': { name: 'Tajland', code: 'TH' },
    'TL': { name: 'Istočni Timor', code: 'TL' },
    'TG': { name: 'Togo', code: 'TG' },
    'TO': { name: 'Tonga', code: 'TO' },
    'TT': { name: 'Trinidad i Tobago', code: 'TT' },
    'TN': { name: 'Tunis', code: 'TN' },
    'TR': { name: 'Turska', code: 'TR' },
    'TM': { name: 'Turkmenistan', code: 'TM' },
    'TV': { name: 'Tuvalu', code: 'TV' },
    'UG': { name: 'Uganda', code: 'UG' },
    'UA': { name: 'Ukrajina', code: 'UA' },
    'AE': { name: 'Ujedinjeni Arapski Emirati', code: 'AE' },
    'GB': { name: 'Ujedinjeno Kraljevstvo', code: 'GB' },
    'US': { name: 'Sjedinjene Američke Države', code: 'US' },
    'UY': { name: 'Urugvaj', code: 'UY' },
    'UZ': { name: 'Uzbekistan', code: 'UZ' },
    'VU': { name: 'Vanuatu', code: 'VU' },
    'VA': { name: 'Vatikan', code: 'VA' },
    'VE': { name: 'Venecuela', code: 'VE' },
    'VN': { name: 'Vijetnam', code: 'VN' },
    'YE': { name: 'Jemen', code: 'YE' },
    'ZM': { name: 'Zambija', code: 'ZM' },
    'ZW': { name: 'Zimbabve', code: 'ZW' }
};

// Export the flags data to make it available to other files
// Using both CommonJS and ES6 module syntax for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = flagsData;
}
