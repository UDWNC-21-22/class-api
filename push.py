import os


msg = input("Enter message commit: ")
os.system("git config user.name ngan1702")
os.system("git config user.email tramngantran@gmail.com")
os.system("git add .")
os.system("""git commit -m " """+msg+""" " """)
os.system("git push origin main")