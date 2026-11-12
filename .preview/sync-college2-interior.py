from pathlib import Path


game = next(Path(".").glob("*.html"))
source = game.read_text(encoding="utf-8")
preview = Path(".preview")
interior = (preview / "college2-interior.js").read_text(encoding="utf-8").rstrip()

if "// BEGIN COLLEGE2_INTERIOR" in source:
    start = source.index("// BEGIN COLLEGE2_INTERIOR")
    end = source.index("// END COLLEGE2_INTERIOR", start) + len("// END COLLEGE2_INTERIOR")
    source = source[:start] + interior + source[end:]
else:
    def replace(old, new):
        global source
        if source.count(old) != 1:
            raise ValueError(f"Expected a single match for {old}")
        source = source.replace(old, new, 1)

    replace("const COLLEGE_MAIN_ENTRANCE=", interior + "\n\nconst COLLEGE_MAIN_ENTRANCE=")
    replace("const locations={college:", """// The south entrance above the steps and beside the ramp of buildCollege2Courtyard.
const COLLEGE2_MAIN_ENTRANCE={x:11.55,z:8.72,radius:2.48,returnPosition:[11.55,1.7,10.95]};
const locations={college:""")
    replace("college1:null,home:null", "college1:null,college2:null,home:null")
    replace("""const requiresHold=target=>target.action==='apartment'||target.action==='enterCollege1';
const holdDuration=target=>target.action==='enterCollege1'?COLLEGE_HOLD_DURATION:APARTMENT_HOLD_DURATION;""",
            """const isCollegeInterior=id=>id==='college1'||id==='college2';
const isCollegeEnter=target=>target.action==='enterCollege1'||target.action==='enterCollege2';
const isCollegeExit=target=>target.action==='exitCollege1'||target.action==='exitCollege2';
const requiresHold=target=>target.action==='apartment'||isCollegeEnter(target);
const holdDuration=target=>isCollegeEnter(target)?COLLEGE_HOLD_DURATION:APARTMENT_HOLD_DURATION;""")
    replace(" return {id:'college-1-main-entrance',allowed:true,action:'enterCollege1'};",
            """ return {id:'college-1-main-entrance',allowed:true,action:'enterCollege1'};
 if(currentLocation==='college'&&Math.abs(C.position.y-1.7)<.35&&C.position.z>=COLLEGE2_MAIN_ENTRANCE.z&&
  Math.abs(C.position.x-COLLEGE2_MAIN_ENTRANCE.x)<1.25&&
  Math.hypot(C.position.x-COLLEGE2_MAIN_ENTRANCE.x,C.position.z-COLLEGE2_MAIN_ENTRANCE.z)<COLLEGE2_MAIN_ENTRANCE.radius)
  return {id:'college-2-main-entrance',allowed:true,action:'enterCollege2'};""")
    replace(" return {id:'college-1-exit',allowed:true,action:'exitCollege1'};",
            """ return {id:'college-1-exit',allowed:true,action:'exitCollege1'};
 if(currentLocation==='college2'&&Math.abs(feetY)<.25&&Math.hypot(C.position.x-activeWorld.exitDoor.x,C.position.z-activeWorld.exitDoor.z)<activeWorld.exitDoor.radius)
  return {id:'college-2-exit',allowed:true,action:'exitCollege2'};""")
    replace("""function exitCollege1(){
 if(currentLocation!=='college1')return;
 locations.college.state={position:COLLEGE_MAIN_ENTRANCE.returnPosition.slice(),yaw:-Math.PI/2,pitch:0,fly:0,feetY:0};""",
            """function exitCollegeInterior(){
 if(!isCollegeInterior(currentLocation))return;
 const fromSecond=currentLocation==='college2';
 const entrance=fromSecond?COLLEGE2_MAIN_ENTRANCE:COLLEGE_MAIN_ENTRANCE;
 locations.college.state={position:entrance.returnPosition.slice(),yaw:fromSecond?Math.PI:-Math.PI/2,pitch:0,fly:0,feetY:0};""")
    replace("if(target.action==='enterCollege1'&&interaction.source", "if(isCollegeEnter(target)&&interaction.source")
    replace("""if(target.action==='enterCollege1'&&currentLocation==='college'){
  switchLocation('college1',{fresh:true});showNotice('Корпус 1 · Прихожая',1800);return;
 }
 if(target.action==='exitCollege1'){exitCollege1();return}""",
            """if(isCollegeEnter(target)&&currentLocation==='college'){
  const second=target.action==='enterCollege2';
  switchLocation(second?'college2':'college1',{fresh:true});
  showNotice(second?'Корпус 2 · Входной холл':'Корпус 1 · Прихожая',1800);return;
 }
 if(isCollegeExit(target)){exitCollegeInterior();return}""")
    replace("collegeDoor=target.action==='enterCollege1'||target.action==='exitCollege1';",
            "collegeDoor=isCollegeEnter(target)||isCollegeExit(target);")
    replace("caption.textContent=target.action==='exitCollege1'?", "caption.textContent=isCollegeExit(target)?")
    replace("target.action==='exitApartment'||target.action==='exitCollege1'||", "target.action==='exitApartment'||isCollegeExit(target)||")
    replace("target.action==='enterCollege1'?'Удерживайте E или кнопку':target.action==='exitCollege1'?",
            "isCollegeEnter(target)?'Удерживайте E или кнопку':isCollegeExit(target)?")
    replace(""" interactButton.setAttribute('aria-label',target.action==='enterCollege1'?'Войти в первый корпус · Удерживайте E или кнопку':target.action==='exitCollege1'?'Выйти из первого корпуса':""",
            """ const collegeEnterLabel=target.action==='enterCollege2'?'Войти во второй корпус · Удерживайте E или кнопку':'Войти в первый корпус · Удерживайте E или кнопку';
 const collegeExitLabel=target.action==='exitCollege2'?'Выйти из второго корпуса':'Выйти из первого корпуса';
 interactButton.setAttribute('aria-label',isCollegeEnter(target)?collegeEnterLabel:isCollegeExit(target)?collegeExitLabel:""")
    replace("interactButton.title=target.action==='enterCollege1'?'Войти в первый корпус · Удерживайте E или кнопку':hint;",
            "interactButton.title=isCollegeEnter(target)?collegeEnterLabel:hint;")
    replace("else if(target.action==='enterCollege1'){if(e.detail===0)", "else if(isCollegeEnter(target)){if(e.detail===0)")
    replace("if(currentLocation==='college1')return activeWorld.roomAt", "if(isCollegeInterior(currentLocation))return activeWorld.roomAt")
    replace("if(currentLocation==='college1'&&id==='college'&&!options.exitingCollege){exitCollege1();return}",
            "if(isCollegeInterior(currentLocation)&&id==='college'&&!options.exitingCollege){exitCollegeInterior();return}")
    replace("buildCollegeEntranceInterior():id==='apartment'", "buildCollegeEntranceInterior():id==='college2'?buildCollege2Interior():id==='apartment'")
    replace("locationButton.textContent=id==='college1'?", "locationButton.textContent=isCollegeInterior(id)?")
    replace("'Выйти из первого корпуса':id==='college'?", "'Выйти из первого корпуса':id==='college2'?'Выйти из второго корпуса':id==='college'?")
    backup = Path(".backups")
    backup.mkdir(exist_ok=True)
    with (backup / "before-college2-interior.html").open("xb") as file:
        file.write(game.read_bytes())

game.write_text(source, encoding="utf-8", newline="\r\n")
