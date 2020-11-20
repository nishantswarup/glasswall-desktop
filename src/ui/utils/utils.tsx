var child_process               = require("child_process");
const path                      = require('path');
var fs                          = require('fs');
const log                       = require('electron-log');
log.transports.file.level       = 'debug';
const MAX_LOG_FILE_SIZE         = 3000000;
const resolve                   = require('path').resolve
const xml2js                    = require('xml2js');

export const GW_DOCKER_IMG_NAME             = 'glasswallsolutions/evaluationsdk:1';
export const GW_DOCKER_IMG_NAME_WO_TAG      = 'glasswallsolutions/evaluationsdk';
export const GW_DOCKER_PULL_IMG_OUTPUT      = 'Downloaded newer image for glasswallsolutions/evaluationsdk';
export const GW_DOCKER_PULL_IMG_OUTPUT_2    = 'Image is up to date for glasswallsolutions/evaluationsdk';
export const GW_DOCKER_EXTRACT_IMG_OUTPUT   = 'Loaded image ID'

export const WEBSITE_URL                = 'https://glasswall-desktop.com';
export const RELEASE_URL                = 'https://github.com/k8-proxy/glasswall-desktop/releases';
export const LICENSE_URL                = 'https://github.com/k8-proxy/glasswall-desktop/blob/master/LICENSE';
export const FW_URL                     = 'https://forensic-workbench.com/';
export const FILE_DROP_URL              = 'https://file-drop.co.uk/';
export const REPO_GIT_ISSUE_URL         = "https://github.com/k8-proxy/glasswall-desktop/issues/new";


export const VERSION                    = '0.1.6'
export const _PROCESSED_FOLDER          = "processed"
export const _LOGS_FOLDER               = "gwlogs"
export const _LOGS_FILE                 = "glasswall_0_1_6.log"
export const _CLEAN_FOLDER              = "clean"
export const _ORIGINAL_FOLDER           = "original"
export const _REPORT_FOLDER             = "report"
export const _ANALYSIS_FOLDER           = "analysis"
export const OUTPUT_DIR_FLAT            = "flat";
export const OUTPUT_DIR_HIERARCY        = "hierarcy";

//Storage Keys Starts
export const WELCOME_PAGE_VISTIED_KEY   = "visited"
export const WELCOME_PAGE_VISTIED_VAL   = "yes"

export const DOCKER_OUPUT_DIR_KEY       = "DOCKER_OUPUT_DIR"
export const CLOUD_OUPUT_DIR_KEY        = "CLOUD_OUPUT_DIR"
export const DOCKER_HEALTH_STATUS_KEY   = "docker_health_status"
export const REBUILD_URL_KEY            = "rebuild_url"
export const ANALYSIS_URL_KEY           = "anaylsis_url"
export const APIKEY_KEY                 = "apikey_key"
//Storage Keys ends


export const REBUILD_TYPE_CLOUD         = "Cloud"
export const REBUILD_TYPE_DOCKER        = "Docker"


const REBUILD_ENGINE_URL         =  'https://8oiyjy8w63.execute-api.us-west-2.amazonaws.com/Prod/api/rebuild/base64';
const REBUILD_ANALYSIS_URL       =  'https://o7ymnow6vf.execute-api.us-west-2.amazonaws.com/Prod/api/Analyse/base64'
const REBUILD_API_KEY            =  'dp2Ug1jtEh4xxFHpJBfWn9V7fKB3yVcv60lhwOAG';

export const DOCKER_RUNNING             =  0; // Docker running;
export const DOCKER_NOT_INSTALLED       =  1; // Docker not installed;
export const DOCKER_NOT_STARTED         =  2; // Docker not started;
export const DOCKER_GW_IMAGE_NOT_PRESENT=  3; // Image not present;
export const LICENSE_NOT_VALID          =  4; // License not valid
export const REBUILD_FAILED             =  5; // File failed rebuild
export const MISSING_OUTPUT_PROPERTY    =  6; //Does not have output property

export const TEXT_PARALLEL              =  "Parallel"
export const TEXT_SEQUENTIAL            =  "Sequential"

const REGEX_SAFE_FILE_NAME              = /[^a-zA-Z0-9-_\.]/g

export const RELEAE_NOTES               =[
                                            {
                                              "date":"November 19th 2020",
                                              "desc":"Fixed left panel logo icons and Added Sorting and Time on Session page."
                                            }, 
                                            {
                                              "date":"November 18th 2020",
                                              "desc":"Integrated processing target with rebuilt sessions metadata : Cloud/Docker."
                                            },
                                            {
                                              "date":"November 18th  2020",
                                              "desc":"Threat Analysis : Integrated Threat analysis of files rebuilt with docker."
                                            }, 
                                            {
                                              "date":"November 17th  2020",
                                              "desc":"Integrated the Policy Management UI with backend."
                                            },
                                            {
                                              "date":"November 16th  2020",
                                              "desc":"Policy Management UI."
                                            }
                                        ]


const archiveLog = (file:string) => {
  file = file.toString();
  const info = path.parse(file);
  try {
    fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
  } catch (e) {
    console.warn('Could not rotate log', e);
  }
}                                      

export const cleanRawLogger = () => {
  let logFile = getLogsPath()
  fs.open(logFile, 'w+')
}

export const getRawLogs = () => { 
  let data = fs.readFileSync(getLogsPath(), 
            {encoding:'utf8', flag:'r'}); 
  if(data.length > MAX_LOG_FILE_SIZE){
    data = data.substring((data.length-MAX_LOG_FILE_SIZE),MAX_LOG_FILE_SIZE)
  }
  return data;
}

export const addRawLogLine = (level:number, filename:string, sentence:string) => {   
  log.transports.file.file        = getLogsPath();
  let levelStr : string;
  levelStr = "ERROR"
  if(level == 0){
    levelStr = "DEBUG"
    log.debug(" - File-Name - "+filename+" --> "+sentence)
  }
  else if (level == 1){
    levelStr = "INFO"
    log.info(" - File-Name - "+filename+" --> "+sentence)
  }    
  else{
    log.error(" - File-Name - "+filename+" --> "+sentence)
  }  
}

export const initLogger = () => {  
  localStorage.removeItem("logs")
  localStorage.setItem("logs","")
}

export const getRebuildEngineUrl=()=>{
  let url: string;
  if(!localStorage.getItem(REBUILD_URL_KEY))
    url = REBUILD_ENGINE_URL;
  else
    url = localStorage.getItem(REBUILD_URL_KEY) || ""

 return url;
}

export const getRebuildAnalysisUrl=()=>{
  let url: string;
  if(!localStorage.getItem(ANALYSIS_URL_KEY))
    url = REBUILD_ANALYSIS_URL;
  else
    url = localStorage.getItem(ANALYSIS_URL_KEY) || ""

 return url;
}

export const getRebuildApiKey=()=>{
  let key: string;
  if(!localStorage.getItem(APIKEY_KEY))
    key = REBUILD_API_KEY;
  else
    key = localStorage.getItem(APIKEY_KEY) || ""

 return key;
}

export const addLogLine = (filename:string, sentence:string) => {     
  const logs  = localStorage.getItem("logs");
  if(logs != null){
    var logsCopy = logs;
    logsCopy +=  "\n"+getLogTime()+" - INFO - File-Name - "+filename+" --> "+sentence+"\n" 
    localStorage.setItem("logs",logsCopy)
  }
  else{
    localStorage.setItem("logs","")
    var logsCopy = "\n"+getLogTime()+" - INFO - File-Name - "+filename+" --> "+sentence+"\n" 
    console.log('adding log '+logsCopy)
    localStorage.setItem("logs",logsCopy)
  }
}

export const getLogs = () => {
  return localStorage.getItem("logs");
}

export const getLogTime = () => {
  var date = new Date();
  var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  return str;
}

export const sleepDelay = (milliseconds:number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  export const sleep = (delay:number) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

  const _p8=(s:boolean) =>{

    var p = (Math.random().toString(16)+"000000000").substr(2,8);
    return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
}
 export const guid=()=> {
    return _p8(false);
    
}

export const stipFileExt =(filename: string)=>{
  return filename.split('.').slice(0, -1).join('.')
}

export const getFileHash=(content: string)=> {
  var crypto = require('crypto');
  // change to 'md5' if you want an MD5 hash
  var hash = crypto.createHash('sha1');

  // change to 'binary' if you want a binary hash.
  hash.setEncoding('hex');

  // the text that you want to hash
  hash.write(content);

  // very important! You cannot read from the stream until you have called end()
  hash.end();

  // and now you get the resulting hash
  var sha1sum = hash.read();
  return sha1sum;
}

// For rebuid
export const CONFIG_INI_REBUILD   = 
"[GWConfig]\n\
processMode=1\n\
reportMode=0\n\
fileStorageMode=2\n\
fileType=*\n\
inputLocation=/input\n\
useSubfolders=1\n\
outputLocation=/output\n\
createOutputFolders=1\n\
nonConformingDirName= NonConforming\n\
managedDirName= Managed\n\
quarantineNonconforming= 1\n\
writeOutput= 1\n";

export const CONFIG_XML_REBUILD   = 
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<config>\n\
<pdfConfig>\n\
<metadata>sanitise</metadata>\n\
<javascript>sanitise</javascript>\n\
<acroform>sanitise</acroform>\n\
<actions_all>sanitise</actions_all>\n\
<embedded_files>sanitise</embedded_files>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<embedded_images>sanitise</embedded_images>\n\
</pdfConfig>\n\
<wordConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<review_comments>sanitise</review_comments>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<dynamic_data_exchange>sanitise</dynamic_data_exchange>\n\
<embedded_images>sanitise</embedded_images>\n\
</wordConfig>\n\
<pptConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<review_comments>sanitise</review_comments>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<embedded_images>sanitise</embedded_images>\n\
</pptConfig>\n\
<xlsConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<review_comments>sanitise</review_comments>\n\
<dynamic_data_exchange>sanitise</dynamic_data_exchange>\n\
<embedded_images>sanitise</embedded_images>\n\
</xlsConfig>	\n\
<tiffConfig>\n\
<geotiff>sanitise</geotiff>\n\
</tiffConfig>\n\
</config>"; 
// For analysis
export const CONFIG_INI   = 
"[GWConfig]\n\
processMode=0\n\
reportMode=0\n\
fileStorageMode=2\n\
fileType=*\n\
inputLocation=/input\n\
useSubfolders=1\n\
outputLocation=/output\n\
createOutputFolders=1\n\
nonConformingDirName= NonConforming\n\
managedDirName= Managed\n\
quarantineNonconforming= 1\n\
writeOutput= 1\n";

export const CONFIG_XML   = 
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<config>\n\
<pdfConfig>\n\
<metadata>sanitise</metadata>\n\
<javascript>sanitise</javascript>\n\
<acroform>sanitise</acroform>\n\
<actions_all>sanitise</actions_all>\n\
<embedded_files>sanitise</embedded_files>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<embedded_images>sanitise</embedded_images>\n\
</pdfConfig>\n\
<wordConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<review_comments>sanitise</review_comments>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<dynamic_data_exchange>sanitise</dynamic_data_exchange>\n\
<embedded_images>sanitise</embedded_images>\n\
</wordConfig>\n\
<pptConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<review_comments>sanitise</review_comments>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<embedded_images>sanitise</embedded_images>\n\
</pptConfig>\n\
<xlsConfig>\n\
<metadata>sanitise</metadata>\n\
<macros>sanitise</macros>\n\
<embedded_files>sanitise</embedded_files>\n\
<internal_hyperlinks>sanitise</internal_hyperlinks>\n\
<external_hyperlinks>sanitise</external_hyperlinks>\n\
<review_comments>sanitise</review_comments>\n\
<dynamic_data_exchange>sanitise</dynamic_data_exchange>\n\
<embedded_images>sanitise</embedded_images>\n\
</xlsConfig>	\n\
<tiffConfig>\n\
<geotiff>sanitise</geotiff>\n\
</tiffConfig>\n\
</config>"; 

export const HEALTH_CHK_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4BAMAAADLSivhAAAAMFBMVEVAoaL///9Hpab4/PxUq6zv9/e43NzX6+ul09ORyclisrPj8fFyubrH4+SAwME/oaJIgbRbAAAEIUlEQVR4Xu3Zf2hbVRQH8LO3LG2y19rT7OU1S1/JWiIgKGayAoNJHooIK9A3BdlESGSiKMI6sYIyyGMVAXSmKAXBjXRMRBmYMBjCABJQBQQxyAQKYiqiKlD694AhL0lf7n3318vLn/YLFE7hk3O593BzIYAjZB/v4xN33rpzKxr++g/w8tDV4fHZb0Bb2tn59/ouJP8cDhtbu0v9jub7RUisDIOr2mWiWgOtHRobnUCr218ly2Fx6WkMxKzda4TDF+PIJFVLhMKZRAHZmM3TIbBxo4G8zOTKarzsIj/nEkpsfo6iVLZVeAuFsXQFttZRnDMtOb6EkmQnpdhYQVnqrhCrY8ZHwFgqjIDnbCk2Hal+UIKNj0Fbl+G6I8YlAIgVZOtuCfEseLFRkrwQdwD2Wmdf2fnnA84aXhXhDPSyjmg0AQD0Nxg83RDgeh9PIC5DN7FyEFstPk4VoU8Qa9CLzpxcno8t2Itr5MBfRSCf8PG0j/MDDMFjP8nHv/lgPDXAkwE8W+DiGvgpFEHU2nK5ODcAbgVErQ2bhy0YxJ4CYevPeHiOwGMZAsdp/DIPTxM4aQGRFQqf4uFHCaw5JF6g8CIP14FIu0pgncIzStyiP4rEaR6+QOJDx0l8kMSWEsePgnDdSjw5A6L9VuNYisLHhsLgFEk8Phx2O1Q5HLYrFN5W4DqFF36iSwVepnCeLicVeIrCY14Za/hT2pDjIxQeP+r9GXyiK8cZCutemRhsxAE5NimspT2y4Z92Qo4RqJh0GVPgIoWfBzptOaZn6k0A7nin+Jgei7s5Go/1gcli9qBf8jG9YxkWs2f1bgBDH/zFxybd2VfUmBjHWMxu92tBvNmbQ5fF7HXwugfYW7DiCDB16Z31AHObmDoKsLU7ANp0EGvdVR8UYWwSfeoeYK7Q2roQE2ChCpztngMU4rQP7i0CExuxEw9gdt1Xvry5UmHxJmbAluDeLj3y3up1YONgUytIcBbEyeNJmEAGi+ZEI8c75pgArhSnCfvDYydK5LOmCjpKMZZ8+8W1H6/ii3v2ezwPsKnAJnUHPIxr3Tr2Lb4NkEQFxjNA5nTqhU+fXNp4BtcA4AklNpqU/s7xwKr3z/tZJcYZoBLb+OVKrbdl59QYnwVuxrI5R43xPM/qTgnaITD+zlqt/Dg84IbBqQ8ZfDmdA9hmMFevBfp+lK6BaEjYbFFzXV7slnZIjM91/BvtqVtY5T7HAIW5fe3G/Pz8zb9/9h8sB3hYndlRsNHFh6NhLI6Cm6PgSlRs/Hq392w4FAFfAGgvR9xt02NTQw0J/c0bPwLc2VbGW3GiOyWt4XEJALQudrlYfUrHPdyI0rmfJIbG7ONuIgKe28N2BJzqW60QGrNPlcMYBRs1z+qFSBitIoDuYDSMxqV3/r8/v+zj/wCkvAtd4Bni/AAAAABJRU5ErkJggg==";
export const HEALTH_CHK_PNG_NAME = "test.png";


export const getPathSep=()=>{
  return path.sep;
}
export const getReportPath =()=>{
  return getAppDataPath() + getPathSep() + _REPORT_FOLDER;
}
export const getCleanPath =()=>{
  return getAppDataPath() + getPathSep() + _CLEAN_FOLDER
  
}
export const getOriginalPath =()=>{
  return getAppDataPath() + getPathSep() + _ORIGINAL_FOLDER
  
}

export const getProcessedPath =()=>{
  return getAppDataPath() + getPathSep() + _PROCESSED_FOLDER
}

export const getDefaultOuputCleanPath =()=>{
  return getAppDataPath() + getPathSep() + _CLEAN_FOLDER
}

export const xml_parser = async (xml_data:string) =>{
  return new Promise(function (resolve, reject) {
      const parser = new xml2js.Parser();
      console.log('xml_data = '+xml_data)
      parser.parseString(xml_data, function (err:Error, result:any) {
          if (err) {
            console.log('xml_data err = '+err.stack)
              reject(err);
          } else {
            console.log('xml_data jsonresult = '+JSON.stringify(result))
              resolve(result);
          }
      });
  });
}

export const getPolicyFlag = (action:string) => {
  if(action == "allow"){
    return 0
  }
  else if(action == "sanitise"){
    return 1
  }
  else if(action == "disallow"){
    return 2
  }
}


export const getPolicy = async () =>{
  let configDir = resolve(getAppDataPath() + getPathSep() + 'config');
    if (!fs.existsSync(configDir)){
        fs.mkdirSync(configDir);
    }
    if (fs.existsSync(configDir+"/config.xml")){        
      const xml = fs.readFileSync(configDir+"/config.xml",{encoding:'utf8', flag:'r'});    
      console.log('File = '+(configDir+"/config.xml"))     
      console.log('xml = '+xml)     
      const json_data = await xml_parser(xml)
      console.log('json out = '+JSON.stringify(json_data))     
      return json_data    
    }
    return null;
  }

  export const savePolicy = async (json:any) =>{
    let configDir = resolve(getAppDataPath() + getPathSep() + 'config');
    let configDirR = resolve(getAppDataPath() + getPathSep() + 'configR');
      if (!fs.existsSync(configDir)){
          fs.mkdirSync(configDir);
      }      
      if (!fs.existsSync(configDirR)){
        fs.mkdirSync(configDirR);
    }      
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(json);
      fs.writeFileSync(path.join(configDir,"config.xml"),xml);            
      fs.writeFileSync(path.join(configDirR,"config.xml"),xml);            
    }

export const getAppDataPath =() =>{
  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "glasswall-desktop");
    }
    case "win32": {
      return path.join(process.env.APPDATA, "glasswall-desktop");
    }
    case "linux": {
      return path.join(process.env.HOME, ".glasswall-desktop");
    }
    default: {
      console.log("Unsupported platform!");
      // process.exit(1);
    }
  }
}

 //save base64 file 
 export const saveBase64File = async(content: string, filePath: string, filename: string)=>{
  //console.log("filePath 1" + filePath)
  !fs.existsSync(filePath) && fs.mkdirSync(filePath, { recursive: true })
  fs.writeFile(filePath +  getPathSep() + filename, content, {encoding: 'base64'}, function(err: any) { if (err) {
          console.log('err', err);
      }
  });
}

//save any text file 
export const saveTextFile = async (xmlContent: string, filePath: string, filename: string) =>{
  //console.log("filePath 2" + filePath)
  !fs.existsSync(filePath) && fs.mkdirSync(filePath, { recursive: true })
  fs.writeFile(filePath + getPathSep() + filename, xmlContent, function(err: any) {if (err) {
              console.log('err', err);
      }
  });
}

export const open_file_exp=(fpath: string)=> {
  console.log("open_file_exp" + fpath )
  var command = '';
  switch (process.platform) {
    case 'darwin':
      command = 'open -R ' + "\'" + fpath +"\'";
      break;
    case 'win32':
      if (process.env.SystemRoot) {
        command = path.join(process.env.SystemRoot, 'explorer.exe');
      } else {
        command = 'explorer.exe';
      }
      fpath = fpath.replace(/\//g, '\\');
      command += ' /select, ' + fpath;
      break;
    default:
      fpath = path.dirname(fpath)
      command = 'xdg-open ' + fpath;
  }
  child_process.exec(command, function(stdout:any) {
  });
}

export const sanitize_file_name = (file_name: string)=> {
  if (typeof(file_name) !== 'string') {
      throw new Error(`[sanitize_file_name] provided value was now a string, it was ${typeof(file_name)}`)
  }
  return file_name.replace(REGEX_SAFE_FILE_NAME, '_')
}


export const getLogsPath = ()=>{
  if(!fs.existsSync(getAppDataPath() + getPathSep() + _LOGS_FOLDER)){
    fs.mkdirSync(getAppDataPath() + getPathSep() + _LOGS_FOLDER);
  }  
  if(!fs.existsSync(getAppDataPath() + getPathSep() + _LOGS_FOLDER+getPathSep()+_LOGS_FILE)){
    fs.openSync(getAppDataPath() + getPathSep() + _LOGS_FOLDER+getPathSep()+_LOGS_FILE,'w');
    fs.closeSync(getAppDataPath() + getPathSep() + _LOGS_FOLDER+getPathSep()+_LOGS_FILE,'w');
  }
  return getAppDataPath() + getPathSep() + _LOGS_FOLDER + getPathSep() + _LOGS_FILE
}

 export const getDockerDefaultOutputFOlder =()=>{
  if(!fs.existsSync(getDefaultOuputCleanPath())){
      fs.mkdirSync(getDefaultOuputCleanPath());
  }
  return localStorage.getItem(DOCKER_OUPUT_DIR_KEY)?
    localStorage.getItem(DOCKER_OUPUT_DIR_KEY):
    getDefaultOuputCleanPath()

   
}
 export const getCloudDefaultOutputFOlder=()=>{
  if(!fs.existsSync(getDefaultOuputCleanPath())){
    fs.mkdirSync(getDefaultOuputCleanPath());
  }
  return localStorage.getItem(CLOUD_OUPUT_DIR_KEY)?
    localStorage.getItem(CLOUD_OUPUT_DIR_KEY):
    getDefaultOuputCleanPath()
}

export const file_size_as_string= (file_size: number)=> {
    
  //Found one bug: file_size type is coming as string to explicitly convert it to Number
  file_size  = Number(file_size)
  
  if (typeof(file_size) !== 'number'){
      return "0 KB"
  }
  if (Math.round(file_size / 1024) == 0) {
      return "1 KB"
  }
  return (file_size / (1024 * 1024 * 1024 -1) <= 1)
      ?  ((file_size / (1024 * 1024 -1) <= 1)
          ? Math.round(file_size / 1024)    + " KB"
          : Math.round(file_size / 1048576) + " MB" )
      : Math.round(file_size / 1073741824)  + " GB"
}
