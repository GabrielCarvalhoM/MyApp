#!/usr/bin/env python3
# CoachingHostLab (front A): writes CoachingHostLab.xcodeproj (the empty host app and the device test bundle that compiles the CoachingHost
# package tests, the HR5R/P0 "plan B"). Deterministic ids; run it again after adding a test file. DEVELOPMENT_TEAM is never written here
# (contract §9: command line only).
import os
HERE=os.path.dirname(os.path.abspath(__file__))
PKG='../../Packages/CoachingHost/Tests/CoachingHostTests'
pkg_tests=['Support.swift','SmokeTests.swift','EquivalenceTests.swift','FacadeReplayTests.swift','PortTests.swift','PlatformTests.swift','CrossProcessTests.swift','ReviewFixTests.swift','ErasureTests.swift','MacKeychainIntegrationTests.swift']
lab_tests=['DeviceTests.swift','PerformanceTests.swift']
n=[0]
def nid():
    n[0]+=1; return 'CC%022X'%n[0]
P=nid();MAIN=nid();PRODG=nid();APP=nid();XCT=nid();HG=nid();PG=nid();TG=nid();DG=nid()
hostRef=nid();hostBF=nid();bmRef=nid();bmBF=nid();fixRef=nid();fixBF=nid()
files=[(f,nid(),nid(),'pkg') for f in pkg_tests]+[(f,nid(),nid(),'lab') for f in lab_tests]
appT=nid();testT=nid();appSrc=nid();appFw=nid();appRes=nid();tSrc=nid();tFw=nid();tRes=nid()
proxy=nid();dep=nid();cfgP=nid();cfgPD=nid();cfgPR=nid();cfgA=nid();cfgAD=nid();cfgAR=nid();cfgT=nid();cfgTD=nid();cfgTR=nid()
pkgs=[('CoachingHost','../../Packages/CoachingHost',nid(),nid(),nid()),('CoachingPresentation','../../Packages/CoachingPresentation',nid(),nid(),nid()),
      ('IntegrationContracts','../../Packages/IntegrationContracts',nid(),nid(),nid())]
o=[]
w=o.append
w('// !$*UTF8*$!\n{\n\tarchiveVersion = 1;\n\tclasses = {\n\t};\n\tobjectVersion = 60;\n\tobjects = {\n')
w('/* Begin PBXBuildFile section */\n')
w(f'\t\t{hostBF} /* HostApp.swift in Sources */ = {{isa = PBXBuildFile; fileRef = {hostRef} /* HostApp.swift */; }};\n')
w(f'\t\t{bmBF} /* BundleModule.swift in Sources */ = {{isa = PBXBuildFile; fileRef = {bmRef} /* BundleModule.swift */; }};\n')
for f,r,b,_ in files: w(f'\t\t{b} /* {f} in Sources */ = {{isa = PBXBuildFile; fileRef = {r} /* {f} */; }};\n')
w(f'\t\t{fixBF} /* Fixtures in Resources */ = {{isa = PBXBuildFile; fileRef = {fixRef} /* Fixtures */; }};\n')
for name,_,_,prod,bf in pkgs: w(f'\t\t{bf} /* {name} in Frameworks */ = {{isa = PBXBuildFile; productRef = {prod} /* {name} */; }};\n')
w('/* End PBXBuildFile section */\n\n/* Begin PBXContainerItemProxy section */\n')
w(f'\t\t{proxy} /* PBXContainerItemProxy */ = {{\n\t\t\tisa = PBXContainerItemProxy;\n\t\t\tcontainerPortal = {P} /* Project object */;\n\t\t\tproxyType = 1;\n\t\t\tremoteGlobalIDString = {appT};\n\t\t\tremoteInfo = CoachingHostLab;\n\t\t}};\n')
w('/* End PBXContainerItemProxy section */\n\n/* Begin PBXFileReference section */\n')
w(f'\t\t{APP} /* CoachingHostLab.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = CoachingHostLab.app; sourceTree = BUILT_PRODUCTS_DIR; }};\n')
w(f'\t\t{XCT} /* CoachingHostDeviceTests.xctest */ = {{isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = CoachingHostDeviceTests.xctest; sourceTree = BUILT_PRODUCTS_DIR; }};\n')
w(f'\t\t{hostRef} /* HostApp.swift */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = HostApp.swift; sourceTree = "<group>"; }};\n')
w(f'\t\t{bmRef} /* BundleModule.swift */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = BundleModule.swift; sourceTree = "<group>"; }};\n')
for f,r,b,_ in files: w(f'\t\t{r} /* {f} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = {f}; sourceTree = "<group>"; }};\n')
w(f'\t\t{fixRef} /* Fixtures */ = {{isa = PBXFileReference; lastKnownFileType = folder; path = Fixtures; sourceTree = "<group>"; }};\n')
w('/* End PBXFileReference section */\n\n/* Begin PBXFrameworksBuildPhase section */\n')
w(f'\t\t{appFw} /* Frameworks */ = {{\n\t\t\tisa = PBXFrameworksBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t}};\n')
w(f'\t\t{tFw} /* Frameworks */ = {{\n\t\t\tisa = PBXFrameworksBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n'+''.join(f'\t\t\t\t{bf} /* {nm} in Frameworks */,\n' for nm,_,_,_,bf in pkgs)+'\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t};\n')
w('/* End PBXFrameworksBuildPhase section */\n\n/* Begin PBXGroup section */\n')
w(f'\t\t{MAIN} = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t{HG} /* HostApp */,\n\t\t\t\t{PG} /* PlanB */,\n\t\t\t\t{DG} /* DeviceTests */,\n\t\t\t\t{TG} /* CoachingHostTests */,\n\t\t\t\t{PRODG} /* Products */,\n\t\t\t);\n\t\t\tsourceTree = "<group>";\n\t\t}};\n')
w(f'\t\t{PRODG} /* Products */ = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t{APP} /* CoachingHostLab.app */,\n\t\t\t\t{XCT} /* CoachingHostDeviceTests.xctest */,\n\t\t\t);\n\t\t\tname = Products;\n\t\t\tsourceTree = "<group>";\n\t\t}};\n')
w(f'\t\t{HG} /* HostApp */ = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t{hostRef} /* HostApp.swift */,\n\t\t\t);\n\t\t\tpath = HostApp;\n\t\t\tsourceTree = "<group>";\n\t\t}};\n')
w(f'\t\t{PG} /* PlanB */ = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t{bmRef} /* BundleModule.swift */,\n\t\t\t);\n\t\t\tpath = PlanB;\n\t\t\tsourceTree = "<group>";\n\t\t}};\n')
w(f'\t\t{DG} /* DeviceTests */ = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n'+''.join(f'\t\t\t\t{r} /* {f} */,\n' for f,r,b,k in files if k=='lab')+'\t\t\t);\n\t\t\tpath = DeviceTests;\n\t\t\tsourceTree = "<group>";\n\t\t};\n')
w(f'\t\t{TG} /* CoachingHostTests */ = {{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n'+''.join(f'\t\t\t\t{r} /* {f} */,\n' for f,r,b,k in files if k=='pkg')+f'\t\t\t\t{fixRef} /* Fixtures */,\n\t\t\t);\n\t\t\tname = CoachingHostTests;\n\t\t\tpath = {PKG};\n\t\t\tsourceTree = "<group>";\n\t\t}};\n')
w('/* End PBXGroup section */\n\n/* Begin PBXNativeTarget section */\n')
w(f'\t\t{appT} /* CoachingHostLab */ = {{\n\t\t\tisa = PBXNativeTarget;\n\t\t\tbuildConfigurationList = {cfgA};\n\t\t\tbuildPhases = (\n\t\t\t\t{appSrc} /* Sources */,\n\t\t\t\t{appFw} /* Frameworks */,\n\t\t\t\t{appRes} /* Resources */,\n\t\t\t);\n\t\t\tbuildRules = (\n\t\t\t);\n\t\t\tdependencies = (\n\t\t\t);\n\t\t\tname = CoachingHostLab;\n\t\t\tproductName = CoachingHostLab;\n\t\t\tproductReference = {APP} /* CoachingHostLab.app */;\n\t\t\tproductType = "com.apple.product-type.application";\n\t\t}};\n')
w(f'\t\t{testT} /* CoachingHostDeviceTests */ = {{\n\t\t\tisa = PBXNativeTarget;\n\t\t\tbuildConfigurationList = {cfgT};\n\t\t\tbuildPhases = (\n\t\t\t\t{tSrc} /* Sources */,\n\t\t\t\t{tFw} /* Frameworks */,\n\t\t\t\t{tRes} /* Resources */,\n\t\t\t);\n\t\t\tbuildRules = (\n\t\t\t);\n\t\t\tdependencies = (\n\t\t\t\t{dep} /* PBXTargetDependency */,\n\t\t\t);\n\t\t\tname = CoachingHostDeviceTests;\n\t\t\tpackageProductDependencies = (\n'+''.join(f'\t\t\t\t{prod} /* {nm} */,\n' for nm,_,_,prod,_ in pkgs)+f'\t\t\t);\n\t\t\tproductName = CoachingHostDeviceTests;\n\t\t\tproductReference = {XCT} /* CoachingHostDeviceTests.xctest */;\n\t\t\tproductType = "com.apple.product-type.bundle.unit-test";\n\t\t}};\n')
w('/* End PBXNativeTarget section */\n\n/* Begin PBXProject section */\n')
w(f'\t\t{P} /* Project object */ = {{\n\t\t\tisa = PBXProject;\n\t\t\tattributes = {{\n\t\t\t\tBuildIndependentTargetsInParallel = 1;\n\t\t\t\tLastSwiftUpdateCheck = 2720;\n\t\t\t\tLastUpgradeCheck = 2720;\n\t\t\t\tTargetAttributes = {{\n\t\t\t\t\t{appT} = {{\n\t\t\t\t\t\tCreatedOnToolsVersion = 27.2;\n\t\t\t\t\t}};\n\t\t\t\t\t{testT} = {{\n\t\t\t\t\t\tCreatedOnToolsVersion = 27.2;\n\t\t\t\t\t\tTestTargetID = {appT};\n\t\t\t\t\t}};\n\t\t\t\t}};\n\t\t\t}};\n\t\t\tbuildConfigurationList = {cfgP};\n\t\t\tcompatibilityVersion = "Xcode 15.0";\n\t\t\tdevelopmentRegion = en;\n\t\t\thasScannedForEncodings = 0;\n\t\t\tknownRegions = (\n\t\t\t\ten,\n\t\t\t\tBase,\n\t\t\t);\n\t\t\tmainGroup = {MAIN};\n\t\t\tpackageReferences = (\n'+''.join(f'\t\t\t\t{ref} /* XCLocalSwiftPackageReference "{path}" */,\n' for nm,path,ref,_,_ in pkgs)+f'\t\t\t);\n\t\t\tproductRefGroup = {PRODG} /* Products */;\n\t\t\tprojectDirPath = "";\n\t\t\tprojectRoot = "";\n\t\t\ttargets = (\n\t\t\t\t{appT} /* CoachingHostLab */,\n\t\t\t\t{testT} /* CoachingHostDeviceTests */,\n\t\t\t);\n\t\t}};\n')
w('/* End PBXProject section */\n\n/* Begin PBXResourcesBuildPhase section */\n')
w(f'\t\t{appRes} /* Resources */ = {{\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t}};\n')
w(f'\t\t{tRes} /* Resources */ = {{\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t{fixBF} /* Fixtures in Resources */,\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t}};\n')
w('/* End PBXResourcesBuildPhase section */\n\n/* Begin PBXSourcesBuildPhase section */\n')
w(f'\t\t{appSrc} /* Sources */ = {{\n\t\t\tisa = PBXSourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t{hostBF} /* HostApp.swift in Sources */,\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t}};\n')
w(f'\t\t{tSrc} /* Sources */ = {{\n\t\t\tisa = PBXSourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t{bmBF} /* BundleModule.swift in Sources */,\n'+''.join(f'\t\t\t\t{b} /* {f} in Sources */,\n' for f,r,b,_ in files)+'\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t};\n')
w('/* End PBXSourcesBuildPhase section */\n\n/* Begin PBXTargetDependency section */\n')
w(f'\t\t{dep} /* PBXTargetDependency */ = {{\n\t\t\tisa = PBXTargetDependency;\n\t\t\ttarget = {appT} /* CoachingHostLab */;\n\t\t\ttargetProxy = {proxy} /* PBXContainerItemProxy */;\n\t\t}};\n')
w('/* End PBXTargetDependency section */\n\n/* Begin XCBuildConfiguration section */\n')
def cfg(i,name,settings): w(f'\t\t{i} /* {name} */ = {{\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbuildSettings = {{\n'+''.join(f'\t\t\t\t{k} = {v};\n' for k,v in settings)+f'\t\t\t}};\n\t\t\tname = {name};\n\t\t}};\n')
base=[('ALWAYS_SEARCH_USER_PATHS','NO'),('CLANG_ENABLE_MODULES','YES'),('CODE_SIGN_STYLE','Automatic'),('ENABLE_USER_SCRIPT_SANDBOXING','YES'),('IPHONEOS_DEPLOYMENT_TARGET','16.0'),('SDKROOT','iphoneos'),('SWIFT_VERSION','5.0'),('TARGETED_DEVICE_FAMILY','"1,2"')]
cfg(cfgPD,'Debug',base+[('DEBUG_INFORMATION_FORMAT','dwarf'),('ENABLE_TESTABILITY','YES'),('ONLY_ACTIVE_ARCH','YES'),('SWIFT_ACTIVE_COMPILATION_CONDITIONS','DEBUG'),('SWIFT_OPTIMIZATION_LEVEL','"-Onone"')])
cfg(cfgPR,'Release',base+[('DEBUG_INFORMATION_FORMAT','"dwarf-with-dsym"'),('ENABLE_TESTABILITY','YES'),('SWIFT_COMPILATION_MODE','wholemodule'),('SWIFT_OPTIMIZATION_LEVEL','"-O"'),('VALIDATE_PRODUCT','YES')])
app=[('GENERATE_INFOPLIST_FILE','YES'),('INFOPLIST_KEY_UILaunchScreen_Generation','YES'),('INFOPLIST_KEY_UIApplicationSceneManifest_Generation','YES'),('PRODUCT_BUNDLE_IDENTIFIER','"fit.vilumo.repmile.lab.coachinghost.$(DEVELOPMENT_TEAM)"'),('PRODUCT_NAME','"$(TARGET_NAME)"'),('SWIFT_EMIT_LOC_STRINGS','NO')]
cfg(cfgAD,'Debug',app);cfg(cfgAR,'Release',app)
tst=[('BUNDLE_LOADER','"$(TEST_HOST)"'),('GENERATE_INFOPLIST_FILE','YES'),('IPHONEOS_DEPLOYMENT_TARGET','17.0'),('PRODUCT_BUNDLE_IDENTIFIER','"fit.vilumo.repmile.lab.coachinghost.$(DEVELOPMENT_TEAM).tests"'),('PRODUCT_NAME','"$(TARGET_NAME)"'),('SWIFT_EMIT_LOC_STRINGS','NO'),('TEST_HOST','"$(BUILT_PRODUCTS_DIR)/CoachingHostLab.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/CoachingHostLab"')]
cfg(cfgTD,'Debug',tst);cfg(cfgTR,'Release',tst)
w('/* End XCBuildConfiguration section */\n\n/* Begin XCConfigurationList section */\n')
for i,a,b in [(cfgP,cfgPD,cfgPR),(cfgA,cfgAD,cfgAR),(cfgT,cfgTD,cfgTR)]: w(f'\t\t{i} = {{\n\t\t\tisa = XCConfigurationList;\n\t\t\tbuildConfigurations = (\n\t\t\t\t{a} /* Debug */,\n\t\t\t\t{b} /* Release */,\n\t\t\t);\n\t\t\tdefaultConfigurationIsVisible = 0;\n\t\t\tdefaultConfigurationName = Release;\n\t\t}};\n')
w('/* End XCConfigurationList section */\n\n/* Begin XCLocalSwiftPackageReference section */\n')
for nm,path,ref,_,_ in pkgs: w(f'\t\t{ref} /* XCLocalSwiftPackageReference "{path}" */ = {{\n\t\t\tisa = XCLocalSwiftPackageReference;\n\t\t\trelativePath = {path};\n\t\t}};\n')
w('/* End XCLocalSwiftPackageReference section */\n\n/* Begin XCSwiftPackageProductDependency section */\n')
for nm,path,ref,prod,_ in pkgs: w(f'\t\t{prod} /* {nm} */ = {{\n\t\t\tisa = XCSwiftPackageProductDependency;\n\t\t\tproductName = {nm};\n\t\t}};\n')
w('/* End XCSwiftPackageProductDependency section */\n\t};\n\trootObject = '+P+' /* Project object */;\n}\n')
d=os.path.join(HERE,'CoachingHostLab.xcodeproj');os.makedirs(os.path.join(d,'xcshareddata','xcschemes'),exist_ok=True)
open(os.path.join(d,'project.pbxproj'),'w').write(''.join(o))
scheme=f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "2720" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{appT}" BuildableName = "CoachingHostLab.app" BlueprintName = "CoachingHostLab" ReferencedContainer = "container:CoachingHostLab.xcodeproj"></BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Release" selectedDebuggerIdentifier = "" selectedLauncherIdentifier = "Xcode.IDEFoundation.Launcher.PosixSpawn" shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
         <TestableReference skipped = "NO">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{testT}" BuildableName = "CoachingHostDeviceTests.xctest" BlueprintName = "CoachingHostDeviceTests" ReferencedContainer = "container:CoachingHostLab.xcodeproj"></BuildableReference>
         </TestableReference>
      </Testables>
   </TestAction>
   <LaunchAction buildConfiguration = "Release" selectedDebuggerIdentifier = "" selectedLauncherIdentifier = "Xcode.IDEFoundation.Launcher.PosixSpawn" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{appT}" BuildableName = "CoachingHostLab.app" BlueprintName = "CoachingHostLab" ReferencedContainer = "container:CoachingHostLab.xcodeproj"></BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
</Scheme>
'''
open(os.path.join(d,'xcshareddata','xcschemes','CoachingHostLab.xcscheme'),'w').write(scheme)
print('written',d)
