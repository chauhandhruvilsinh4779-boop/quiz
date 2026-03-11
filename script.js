let user={}
let timer
let time=600

const questions={

ds:[
{q:"Which DS uses LIFO?",o:["Queue","Stack","Tree","Array"],a:"Stack"},
{q:"Binary search complexity?",o:["O(n)","O(log n)","O(1)","O(n²)"],a:"O(log n)"},
{q:"Heap stored in?",o:["Array","Tree","Stack","Graph"],a:"Array"},
{q:"BFS uses?",o:["Stack","Queue","Array","List"],a:"Queue"},
{q:"Balanced tree height?",o:["log n","n","n²","n log n"],a:"log n"},
{q:"Stable sorting?",o:["Merge","Quick","Heap","Selection"],a:"Merge"},
{q:"Graph shortest path?",o:["DFS","BFS","Dijkstra","Prim"],a:"Dijkstra"},
{q:"Linked list uses?",o:["Pointers","Indexes","Nodes","Trees"],a:"Pointers"},
{q:"Which traversal root first?",o:["Preorder","Inorder","Postorder","Level"],a:"Preorder"},
{q:"Which DS FIFO?",o:["Stack","Queue","Heap","Tree"],a:"Queue"}
],

os:[
{q:"FCFS is?",o:["Preemptive","Non-preemptive","Hybrid","None"],a:"Non-preemptive"},
{q:"Deadlock conditions?",o:["3","4","5","6"],a:"4"},
{q:"Avoid deadlock?",o:["Banker","FIFO","LRU","SCAN"],a:"Banker"},
{q:"Virtual memory uses?",o:["Disk","RAM","Cache","CPU"],a:"Disk"},
{q:"Thrashing cause?",o:["Low paging","High paging","Deadlock","Cache"],a:"High paging"},
{q:"Semaphore used for?",o:["Sync","Memory","File","Driver"],a:"Sync"},
{q:"Kernel is?",o:["OS core","Hardware","Program","Compiler"],a:"OS core"},
{q:"Round Robin uses?",o:["Quantum","Priority","Stack","Queue"],a:"Quantum"},
{q:"Process first state?",o:["Ready","Running","Waiting","Dead"],a:"Ready"},
{q:"Page replacement?",o:["LRU","DFS","BFS","Prim"],a:"LRU"}
],

cn:[
{q:"Routing layer?",o:["Network","Transport","Session","Physical"],a:"Network"},
{q:"TCP type?",o:["Connection oriented","Connectionless","Slow","Encrypted"],a:"Connection oriented"},
{q:"DNS converts?",o:["Domain to IP","IP to domain","URL","File"],a:"Domain to IP"},
{q:"HTTP port?",o:["21","25","80","443"],a:"80"},
{q:"OSI layers?",o:["5","6","7","8"],a:"7"},
{q:"UDP is?",o:["Connectionless","Reliable","Slow","Secure"],a:"Connectionless"},
{q:"MAC bits?",o:["48","32","64","16"],a:"48"},
{q:"Ping uses?",o:["ICMP","TCP","UDP","FTP"],a:"ICMP"},
{q:"Star topology center?",o:["Hub","Switch","Router","Bridge"],a:"Hub"},
{q:"IP means?",o:["Internet Protocol","Internal Process","Input Port","Internet Port"],a:"Internet Protocol"}
],

dbms:[
{q:"SQL stands for?",o:["Structured Query Language","Simple Query Language","System Query Language","Sequential Query Language"],a:"Structured Query Language"},
{q:"Primary key?",o:["Unique","Duplicate","Null","Optional"],a:"Unique"},
{q:"Normalization reduces?",o:["Redundancy","Speed","Security","Index"],a:"Redundancy"},
{q:"2NF removes?",o:["Partial dependency","Full dependency","Transitive","Join"],a:"Partial dependency"},
{q:"Foreign key?",o:["Link tables","Delete table","Sort","Index"],a:"Link tables"},
{q:"DROP command?",o:["Delete table","Delete row","Create table","Update"],a:"Delete table"},
{q:"JOIN used for?",o:["Combine tables","Delete","Insert","Sort"],a:"Combine tables"},
{q:"Index improves?",o:["Speed","Security","Storage","Backup"],a:"Speed"},
{q:"ACID A means?",o:["Atomicity","Accuracy","Access","Action"],a:"Atomicity"},
{q:"Relational model uses?",o:["Tables","Trees","Graphs","Objects"],a:"Tables"}
]

}

let qset=[]

function nextPage(){

user.name=document.getElementById("name").value
user.roll=document.getElementById("roll").value
user.class=document.getElementById("class").value

document.getElementById("userPage").classList.add("hidden")
document.getElementById("subjectPage").classList.remove("hidden")

}

function startQuiz(){

let sub=document.getElementById("subject").value

qset=questions[sub]

document.getElementById("title").innerText=sub.toUpperCase()+" Quiz"

let form=document.getElementById("quizForm")

form.innerHTML=""

qset.forEach((q,i)=>{

let html=`<div class='question'><p>${i+1}. ${q.q}</p>`

q.o.forEach(opt=>{
html+=`<label><input type='radio' name='q${i}' value='${opt}'> ${opt}</label><br>`
})

html+="</div>"

form.innerHTML+=html

})

document.getElementById("subjectPage").classList.add("hidden")
document.getElementById("quizPage").classList.remove("hidden")

startTimer()

}

function startTimer(){

let timerDisplay=document.getElementById("timer")

timer=setInterval(()=>{

time--

let m=Math.floor(time/60)
let s=time%60

timerDisplay.innerText=`${m}:${s<10?"0":""}${s}`

if(time<=0){
clearInterval(timer)
submitQuiz()
}

},1000)

}

function submitQuiz(){

clearInterval(timer)

let score=0
let wrong=""

qset.forEach((q,i)=>{

let ans=document.querySelector(`input[name=q${i}]:checked`)

if(ans && ans.value==q.a){
score++
}else{
wrong+=`<div class='result-box'><b>${q.q}</b><br>Correct: ${q.a}</div>`
}

})

document.getElementById("quizPage").classList.add("hidden")
document.getElementById("resultPage").classList.remove("hidden")

document.getElementById("resultInfo").innerHTML=`
<div class='result-box'>
Name: ${user.name}<br>
Roll: ${user.roll}<br>
Class: ${user.class}<br>
Score: ${score}/10
</div>
`

document.getElementById("wrong").innerHTML=wrong || "All answers correct 🎉"

window.finalScore=score

}

function downloadPDF(){

const { jsPDF } = window.jspdf

let doc=new jsPDF()

doc.text("Quiz Result",20,20)

doc.text(`Name: ${user.name}`,20,40)
doc.text(`Roll: ${user.roll}`,20,50)
doc.text(`Class: ${user.class}`,20,60)
doc.text(`Score: ${window.finalScore}/10`,20,70)

doc.save("quiz_result.pdf")

}
