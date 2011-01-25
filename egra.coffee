login = new JQueryMobilePage()
instructions = new JQueryMobilePage()
letters = new JQueryMobilePage()

login.page_id = "Login"
login.header = "<h1>EGRA</h1>"
login.next_page = instructions
login.content = (new JQueryLogin()).render()

instructions.page_id = "Instructions"
instructions.header = "<h1>EGRA</h1>"
instructions.next_page = letters
instructions.content = "Show the child the sheet of letters in the student stimuli booklet. Say:
Here is a page full of letters of the alphabet. Please tell me the NAMES of as many letters as you can--
not the SOUNDS of the letters, but the names.
For example, the name of this letter [point to A] is 'A'
Let's practise: tell me the name of this letter [point to V]:
If the child responds correctly say: Good, the name of this letter is 'VEE.'
If the child does not respond correctly, say: The name of this letter is 'VEE.'
Now try another one: tell me the name of this letter [point to L]:
If the child responds correctly say: Good, the name of this letter is 'ELL.'
If the child does not respond correctly, say: The name of this letter is 'ELL.'
Do you understand what you are to do?
When I say 'Begin,' please name the letters as quickly and carefully as you can. Start here and continue
this way. [Point to the first letter on the row after the example and draw your finger across the first line]. If you come
to a letter you do not know, I will tell it to you. Otherwise I will keep quiet & listen to you. Ready? Begin.
Start the timer when the child reads the first letter. Follow along with your pencil and clearly mark any
incorrect letters with a slash ( / ). Count self-corrections as correct. If you've already marked the self-corrected
letter as incorrect, circle the letter and go on. Stay quiet, except when providing answers as follows: if the child
hesitates for 3 seconds, provide the name of the letter, point to the next letter and say 'Please go on.' Mark the
letter you provide to the child as incorrect. If the student gives you the letter sound, rather than the name, provide
the letter name and say: ['Please tell me the NAME of the letter']. This prompt may be given only once
during the exercise.
AFTER 60 SECONDS SAY, 'stop.' Mark the final letter read with a bracket ( ] ).
Early stop rule: If the child does not give a single correct response on the first line, say 'Thank you!',
discontinue this exercise, check the box at the bottom, and go on to the next exercise."


randomLetter = () ->
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  chars = chars + chars.toLowerCase()
  return chars[Math.floor(Math.random()*chars.length)]

letters.page_id = "Letters"
letters.header = "<h1>EGRA</h1>"
lettersCheckboxes = new JQueryCheckboxGroup()
lettersCheckboxes.checkboxes = []

url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
googleSpreadsheet = new GoogleSpreadsheet()
googleSpreadsheet.url(url)
googleSpreadsheet.load (result) ->
  console.log(result)

for index in [1..100]
  checkbox = new JQueryCheckbox()
  checkbox.unique_name = "checkbox_#{index}"
  checkbox.content = randomLetter()
  lettersCheckboxes.checkboxes.push checkbox
timer = new Timer()
letters.content = timer.render() + lettersCheckboxes.three_way_render()

body = ""
for page in [login, instructions, letters]
  body += page.render()

$("body").html(body)

