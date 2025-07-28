export const createManifest = (questions: any[]) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST-${Date.now()}" 
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="TOC1">
    <organization identifier="TOC1">
      <title>Quiz</title>
      <item identifier="ITEM1" identifierref="RESOURCE1">
        <title>Quiz Questions</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RESOURCE1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scripts/scormAPI.js"/>
    </resource>
  </resources>
</manifest>`;
};