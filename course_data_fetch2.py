import requests

from datetime import datetime
from datetime import timedelta

server_baseurl = "http://localhost:5000/api"
artsci_tt_baseurl = "https://timetable.iit.artsci.utoronto.ca/api"
secret_id = "aw12kjebf23429jae0aklr29304rjq9t7iro345"
# session is either 
# "year"+"5" (for summmer session) or 
# "year"+"9" (for normal year session)
def get_current_session():
    current_time = datetime.now()
    current_month = current_time.month
    
    # the school year when we are jan to april is the previous year
    if (1 <= current_month and current_month <= 4): 
        current_time -= timedelta(days=365)

    session_string = str(current_time.year)
    if (5 <= current_month and current_month <= 8):
        session_string += "5"
    else:
        session_string += "9"
        
    print("Current Session: " + session_string)
    return session_string

# section is either "F", "S"
# we always load "Y" regardless
def get_current_section():
    current_time = datetime.now()
    current_month = current_time.month

    if (1 <= current_month and current_month <= 4) or \
            (7 <= current_month and current_month <= 8): 
        return "S"
    else:
        return "F"

def get_orgs():
    try:
        request = requests.get(url = artsci_tt_baseurl + "/orgs")
        response_json = request.json() 

        list_of_orgs = []
        for org in response_json["orgs"]:
            list_of_orgs.append({"name": org, "description": response_json["orgs"][org]})

        return list_of_orgs
    except:
        print("Error occured in get_orgs()")
        return None

def get_org_courses(org, session, section):
    print("Processing courses for " + org + "(" + session + "" + section + ")")
    try:
        # https://timetable.iit.artsci.utoronto.ca/api/20205/courses?org=CSC
        request = requests.get(url = artsci_tt_baseurl + "/" + session + "/courses?org=" + org + "&section=" + section)
        response_json = request.json() 

        list_of_courses = []
        for course in response_json:
            # print(course)
            course_data = response_json[course]

            course_lectures = []
            for meeting in course_data["meetings"]:
                meeting_data = course_data["meetings"][meeting]
                if meeting.startswith("LEC") and meeting_data["cancel"] != "Cancelled":
                    lecture_instructors = []
                    for instructor in meeting_data["instructors"]:
                        instructor_data = meeting_data["instructors"][instructor]
                        lecture_instructors.append(instructor_data)

                    course_lecture = { "meetingId": meeting_data["meetingId"], \
                        "teachingMethod": meeting_data["teachingMethod"], \
                        "sectionNumber": meeting_data["sectionNumber"], \
                        # careful here, output enrolment only has 1 "l"
                        "enrolmentCapacity": meeting_data["enrollmentCapacity"], \
                        "actualEnrolment": meeting_data["actualEnrolment"], \
                        "actualWaitlist": meeting_data["actualWaitlist"], \
                        "instructors": lecture_instructors }
                    
                    course_lectures.append(course_lecture)

            course_info = { "courseId": course_data["courseId"], \
                "orgName": course_data["org"], \
                "orgDescription": course_data["orgName"], \
                "code": course_data["code"], \
                "section": course_data["section"], \
                "courseDescription": course_data["courseDescription"], \
                "session": course_data["session"], \
                "lectures": course_lectures }
            list_of_courses.append(course_info)
        
        return list_of_courses
    except:
        print("Error occured in get_org_courses()")
        return None

def send_org_data(org_data):
    try:
        request = requests.post(url = server_baseurl + "/organization", \
            json = {"secretId": secret_id, "data": org_data})
        response_json = request.json() 

        print(response_json)
        return True
    except:
        print("Error occured in send_org_data()")
        return False
    

def send_course_data(course_data):
    try:
        request = requests.post(url = server_baseurl + "/course/batch_processing", \
            json = {"secretId": secret_id, "data": course_data})
        response_json = request.json() 

        print(response_json)
        return True
    except:
        print("Error occured in send_course_data()")
        return False
    
current_session = get_current_session()
current_section = get_current_section()
orgs = get_orgs()
send_org_data(orgs)
print("Sending org data")

num_error_get = 0
orgs_get_with_error = []
num_error_send = 0
orgs_send_with_error = []

for org in orgs:
    org_courses = get_org_courses(org["name"], current_session, current_section)
    
    if org_courses is None:
        num_error_get += 1
        orgs_get_with_error.append(org["name"])
        continue
    if not org_courses: # this implies no error, but course array is empty
        continue

    print("Sending course data for " + org["name"] + " Number of courses = " + str(len(org_courses)))
    if not send_course_data(org_courses):
        num_error_send += 1
        orgs_send_with_error.append(org["name"])
        continue 

for org in orgs:
    org_courses = get_org_courses(org["name"], current_session, "Y")
    
    if org_courses is None:
        num_error_get += 1
        orgs_get_with_error.append(org["name"])
        continue
    if not org_courses: # this implies no error, but course array is empty
        continue

    print("Sending course data for " + org["name"] + " Number of courses = " + str(len(org_courses)))
    if not send_course_data(org_courses):
        num_error_send += 1
        orgs_send_with_error.append(org["name"])
        continue 

print("num_error_get = " + str(num_error_get))
print(orgs_get_with_error)
print("num_error_send = " + str(num_error_send))
print(orgs_send_with_error)