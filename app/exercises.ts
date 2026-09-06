export type Exercise = {id:string;name:string;group:string;equipment:string;motion:number;primary:string[];secondary:string[];match:string[];assist:string[];action:string;cues:string[];phase:[string,string];view:'front'|'back'|'side'};
export const groups=['Biceps','Triceps','Shoulders','Back','Legs'];
export const muscleDescriptions:Record<string,string>={
 'Biceps brachii':'Bends the elbow and turns the palm upward.',
 'Brachialis':'A deep upper-arm muscle that powerfully bends the elbow.',
 'Brachioradialis':'Helps bend the elbow, especially with a neutral grip.',
 'Triceps brachii':'Straightens the elbow and supports pressing movements.',
 'Anconeus':'A small muscle that assists elbow extension and stability.',
 'Posterior deltoid':'Draws the upper arm backward and steadies the shoulder.',
 'Deltoids':'Lift and position the upper arms around the shoulder joint.',
 'Lateral deltoids':'Lift the arms out to the sides.',
 'Trapezius':'Moves and stabilizes the shoulder blades and upper spine.',
 'Supraspinatus':'Starts the arm raise and helps stabilize the shoulder.',
 'Latissimus dorsi':'Draws the upper arm down and back toward the torso.',
 'Rhomboids':'Pull the shoulder blades toward the spine.',
 'Quadriceps':'Straighten the knee and help control a squat descent.',
 'Gluteus maximus':'Extends the hip and drives the body upward.',
 'Adductors':'Draw the thighs inward and help stabilize the hips.',
 'Erector spinae':'Hold the spine steady and assist trunk extension.',
 'Hamstrings':'Bend the knee and extend the hip.',
 'Gastrocnemius':'Raises the heel and assists knee flexion.',
 'Soleus':'Raises the heel and supports standing posture.',
 'Tibialis posterior':'Supports the foot arch and helps point the ankle.',
};
export function describeMuscle(name:string){return muscleDescriptions[name]??'Assists and stabilizes this movement.'}
export const exercises:Exercise[]=[
{id:'curl',name:'Dumbbell curl',group:'Biceps',equipment:'Dumbbells',motion:0,primary:['Biceps brachii'],secondary:['Brachialis','Brachioradialis'],match:['biceps brachii'],assist:['brachialis','brachioradialis'],action:'The biceps shorten to bend your elbows, then lengthen as you lower the weights.',cues:['Keep upper arms close to your ribs.','Curl without swinging your torso.','Lower slowly with your wrists straight.'],phase:['Curl up','Lower with control'],view:'front'},
{id:'hammer',name:'Hammer curl',group:'Biceps',equipment:'Dumbbells',motion:1,primary:['Brachialis','Brachioradialis'],secondary:['Biceps brachii'],match:['brachialis','brachioradialis'],assist:['biceps brachii'],action:'A neutral grip emphasizes elbow flexion through the brachialis and brachioradialis, with help from the biceps.',cues:['Keep palms facing inward.','Hold your elbows by your sides.','Lift and lower through a comfortable range.'],phase:['Curl up','Lower with control'],view:'front'},
{id:'extension',name:'Overhead extension',group:'Triceps',equipment:'Dumbbells',motion:2,primary:['Triceps brachii'],secondary:['Anconeus'],match:['triceps brachii'],assist:['anconeus'],action:'The triceps straighten your elbows from the overhead position, then control the bend on the return.',cues:['Keep ribs down and upper arms steady.','Bend elbows to lower behind your head.','Extend without forcefully locking your elbows.'],phase:['Extend elbows','Bend elbows'],view:'side'},
{id:'kickback',name:'Triceps kickback',group:'Triceps',equipment:'Dumbbells',motion:3,primary:['Triceps brachii'],secondary:['Posterior deltoid'],match:['triceps brachii'],assist:['spinal part','anconeus'],action:'The triceps extend the elbows while the shoulders hold the upper arms alongside the torso.',cues:['Hinge at your hips with a long spine.','Keep upper arms still.','Straighten elbows without swinging.'],phase:['Extend back','Return slowly'],view:'side'},
{id:'press',name:'Shoulder press',group:'Shoulders',equipment:'Dumbbells',motion:4,primary:['Deltoids'],secondary:['Triceps brachii','Trapezius'],match:['deltoid'],assist:['triceps brachii','trapezius'],action:'The deltoids raise the upper arms while the triceps straighten the elbows to press overhead.',cues:['Start with weights around shoulder height.','Press up without arching your lower back.','Lower to a comfortable shoulder position.'],phase:['Press up','Lower weights'],view:'front'},
{id:'raise',name:'Lateral raise',group:'Shoulders',equipment:'Dumbbells',motion:5,primary:['Lateral deltoids'],secondary:['Supraspinatus','Trapezius'],match:['acromial part'],assist:['supraspinatus','trapezius'],action:'The lateral deltoids lift your arms away from your sides, assisted by the supraspinatus.',cues:['Maintain a slight bend in your elbows.','Raise arms to about shoulder height.','Avoid shrugging or using momentum.'],phase:['Raise outward','Lower slowly'],view:'front'},
{id:'row',name:'Bent-over row',group:'Back',equipment:'Dumbbells',motion:6,primary:['Latissimus dorsi','Rhomboids'],secondary:['Biceps brachii','Posterior deltoid'],match:['latissimus','rhomboid'],assist:['biceps brachii','spinal part','trapezius'],action:'The lats draw the upper arms back while the rhomboids bring the shoulder blades toward the spine.',cues:['Hinge at the hips and brace your trunk.','Draw elbows back toward your hips.','Lower weights without rounding your back.'],phase:['Pull to ribs','Reach down'],view:'back'},
{id:'pulldown',name:'Lat pulldown',group:'Back',equipment:'Cable machine',motion:7,primary:['Latissimus dorsi'],secondary:['Biceps brachii','Rhomboids'],match:['latissimus'],assist:['biceps brachii','rhomboid','trapezius'],action:'The lats bring the upper arms down toward the torso; the elbow flexors assist the pull.',cues:['Keep your chest lifted and torso steady.','Pull toward the upper chest, not behind the neck.','Let arms extend upward with control.'],phase:['Pull down','Return overhead'],view:'back'},
{id:'squat',name:'Bodyweight squat',group:'Legs',equipment:'Bodyweight',motion:8,primary:['Quadriceps','Gluteus maximus'],secondary:['Adductors','Erector spinae'],match:['vastus','rectus femoris','gluteus maximus'],assist:['adductor','iliocostalis','longissimus'],action:'The quads and glutes lengthen as you descend, then shorten to straighten your knees and hips.',cues:['Plant your feet and brace your trunk.','Bend hips and knees together.','Keep knees tracking in the direction of your toes.'],phase:['Lower into squat','Drive to stand'],view:'side'},
{id:'rdl',name:'Romanian deadlift',group:'Legs',equipment:'Dumbbells',motion:9,primary:['Hamstrings','Gluteus maximus'],secondary:['Erector spinae','Adductors'],match:['biceps femoris','semitendinosus','semimembranosus','gluteus maximus'],assist:['iliocostalis','longissimus','adductor'],action:'The hamstrings and glutes control the hip hinge and extend the hips as you stand.',cues:['Keep a soft bend in your knees.','Push hips back with weights close to your legs.','Stand by driving your hips forward without leaning back.'],phase:['Hinge at hips','Stand tall'],view:'side'},
{id:'calf',name:'Standing calf raise',group:'Legs',equipment:'Bodyweight',motion:10,primary:['Gastrocnemius','Soleus'],secondary:['Tibialis posterior'],match:['gastrocnemius','soleus'],assist:['tibialis posterior'],action:'The calf muscles lift your heels by pointing the ankles, then control the return to the floor.',cues:['Use support for balance if needed.','Rise onto the balls of your feet.','Lower heels slowly without bouncing.'],phase:['Lift heels','Lower heels'],view:'side'},
];
export function roleFor(name:string,e:Exercise){const n=name.toLowerCase();return e.match.some(s=>n.includes(s))?2:e.assist.some(s=>n.includes(s))?1:0}
