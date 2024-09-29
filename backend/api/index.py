from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
# from transformers import pipeline

from mailjet_rest import Client
import os

from groq import Groq


app = Flask(__name__)
CORS(app)  # This allows all origins by default

@app.route('/')
def home():
    return "Welcome to the InformedVotr backend."

# ---------------------------- SUMMARIZATION W GROQ (new) ----------------------------
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

@app.route('/summarize_groq', methods=['POST'])
def summarize_groq():

    cutoff_phrase = "DIGEST KEY"
    data = request.json
    text = data.get('text', '')
    # print("OG TEXT : ")
    # print(text)
    
    # print('SHORTENED TEXT')
    # print(text.split(cutoff_phrase)[0])
    shortened_text = text.split(cutoff_phrase)[0]
    my_prompt = "Please summarize this in 2 paragraphs: \n" + shortened_text
    #print(my_prompt)

    chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": my_prompt,
        }
    ],
    model="llama-3.1-70b-versatile",
)
    summarized_text = chat_completion.choices[0].message.content
    return jsonify({'summarized_text': summarized_text})
# ------------------------------------------------------------------------------------




# ---------------------------- SUMMARIZATION W HUGGINGFACE (old) ----------------------------

# summarizer = pipeline("summarization")

# @app.route('/summarize', methods=['POST'])
# def summarize():
#     cutoff_phrase = "DIGEST KEY"
#     data = request.json
#     text = data.get('text', '')
#     print("OG TEXT : ")
#     print(text)
    
#     print('SHORTENED TEXT')
#     print(text.split(cutoff_phrase)[0])

#     # PARSE FIRST SECTION OF TEXT
#     # text = "AB 1, McKinnor. Collective bargaining: Legislature. Existing law, the Ralph C. Dills Act (Dills Act), governs collective bargaining between the state and recognized state public employee organizations. Existing law excludes certain employees from coverage under the Dills Act, including, among others, managerial employees, supervisory employees, and confidential employees, as defined. Existing law creates the Public Employment Relations Board and authorizes it, among other things, to determine appropriate state employee bargaining units, as specified. This bill would enact the Legislature Employer-Employee Relations Act, to provide employees of the Legislature, except certain specified categories of excluded employees, the right to form, join, and participate in the activities of employee organizations of their own choosing for the purpose of representation on all matters of employer-employee relations. The bill would prescribe rights, duties, and prohibitions in this context that parallel those in the Dills Act. For the purposes of bargaining or meeting and conferring in good faith, the bill would define âemployerâ to mean the Assembly Committee on Rules or the Senate Committee on Rules. The bill would require the employer to meet and confer with representatives of recognized employee organizations regarding matters within the scope of representation. The bill would exclude certain matters from the scope of representation, as specified. The bill would grant exclusive jurisdiction to the Public Employment Relations Board to make an initial determination as to whether charges of unfair practices are justified, and, if so, the necessary remedy, as specified. However, the bill would prohibit the board from issuing a decision or order that intrudes upon or interferes with the Legislatureâs core function of efficient and effective lawmaking or the essential operation of the Legislature. The bill would require the board to determine appropriate bargaining units, and would prohibit the board from including employees in a bargaining unit that includes employees other than those of the employer. The bill would prohibit the board from including within a bargaining unit employees from both the Assembly and Senate.. This bill would make it a misdemeanor for any person to willfully resist, prevent, impede, or interfere with any member of the board, or any of its agents, in the performance of duties pursuant to its provisions. By expanding the definition of a crime, this bill would impose a state-mandated local program. The bill would provide that the provisions of the Legislature Employer-Employee Relations Act are severable. The bill would become operative on July 1, 2026. The California Constitution requires the state to reimburse local agencies and school districts for certain costs mandated by the state. Statutory provisions establish procedures for making that reimbursement. This bill would provide that no reimbursement is required by this act for a specified reason. This bill would additionally exempt from public inspection records related to activities governed by the Legislature Employer-Employee Relations Act that reveal the employerâs deliberative processes, impressions, evaluations, opinions, recommendations, meeting minutes, research, work product, theories, or strategy, or that provide instruction, advice, or training to employees who do not have full collective bargaining and representation rights under the Legislature Employer-Employee Relations Act. Existing constitutional provisions require that a statute that limits the right of access to the meetings of public bodies or the writings of public officials and agencies be adopted with findings demonstrating the interest protected by the limitation and the need for protecting that interest. This bill would make legislative findings to that effect."
#     # text = "AB 3, as introduced, Bains. Petroleum refineries: imports. The California Global Warming Solutions Act of 2006 establishes the State Air Resources Board as the state agency responsible for monitoring and regulating sources emitting greenhouse gases. The act requires the state board to ensure that statewide greenhouse gas emissions are reduced to at least 40 percent below the 1990 level by 2030. The act authorizes the state board to include the use of market-based compliance mechanisms in its regulation of emissions of greenhouse gases. Existing law requires the state board to designate a specified market-based compliance mechanism as the rule for petroleum refineries and oil and gas production facilities to achieve their greenhouse gas emissions reductions, as provided. The Petroleum Industry Information Reporting Act of 1980 requires each refiner, within 30 days after the end of each monthly reporting period, to submit to the State Energy Resources Conservation and Development Commission certain information regarding imports of finished petroleum products and blendstocks by type, including the source of those imports, as provided. Existing law requires the commission to request from destination facilities, as defined, certain information regarding crude oil transported to or within California via railcar or marine vessel, and to quarterly prepare and make available to the public a report based on that collected information, as provided. This bill would, commencing January 1, 2030, prohibit a petroleum refinery licensed to operate in the state from using oil originally extracted outside the state for more than 60% of the total oil that the refinery processes on an annual basis. Commencing January 1, 2035, the bill would prohibit a petroleum refinery licensed to operate in the state from using oil originally extracted outside the state for more than 50% of the total oil that the refinery processes on an annual basis."
#     # text = "The tiger (Panthera tigris) is a member of the genus Panthera and the largest living cat species native to Asia. It has a powerful, muscular body with a large head and paws, a long tail and orange fur with black, mostly vertical stripes. It is traditionally classified into nine recent subspecies, though some recognise only two subspecies, mainland Asian tigers and the island tigers of the Sunda Islands. Throughout the tiger's range, it inhabits mainly forests, from coniferous and temperate broadleaf and mixed forests in the Russian Far East and Northeast China to tropical and subtropical moist broadleaf forests on the Indian subcontinent and Southeast Asia. The tiger is an apex predator and preys mainly on ungulates, which it takes by ambush. It lives a mostly solitary life and occupies home ranges, which it defends from individuals of the same sex. The range of a male tiger overlaps with that of multiple females with whom he mates. Females give birth to usually two or three cubs that stay with their mother for about two years. When becoming independent, they leave their mother's home range and establish their own."
   
#     summary = summarizer(text.split(cutoff_phrase)[0], max_length=300, min_length=25, do_sample=False)
#     # print("SUMMARY : ")
#     # print(summary)

#     return jsonify(summary)
# ------------------------------------------------------------------------------------



# --------------------------------------- MAILJET EMAIL LIST ---------------------------------------

api_key = '33f7053ed3e293d92854787b8af95a77' # os.environ['MJ_APIKEY_PUBLIC']
api_secret = '3a35e7c48c38608ba70f38af9fdf9998' # os.environ['MJ_APIKEY_PRIVATE']
mailjet = Client(auth=(api_key, api_secret))
list_id = '10460647'

@app.route('/subscribe', methods=['POST'])
def subscribe():
    print("inside subscribe...")
    data = request.get_json()
    email = data.get('email')
    print(email)

    # --------------------------------------------------------------------
    contact_data = {
        'Email': email
    }
    result = mailjet.contact.create(data=contact_data)
    # --------------------------------------------------------------------
    # email_data = {
    #     'Messages': [
    #         {
    #             "From": {
    #                 "Email": "ishanidas05@gmail.com",
    #                 "Name": "Me"
    #             },
    #             "To": [
    #                 {
    #                 "Email": email,
    #                 "Name": "You"
    #                 }
    #             ],
    #             "Subject": "You've joined the newsletter!",
    #             "TextPart": "Greetings from InformedVotr!",
    #             "HTMLPart": "<h3>Welcome!</h3><br />Be on the lookout for monthly newsletters about updates on new bills/laws pertaining to your state."
    #         }
    #     ]
    # }
    # result2 = mailjet.send.create(data=email_data)
    # --------------------------------------------------------------------

    # if result.status_code == 201 and result2.status_code == 201:
    #     return jsonify({'message': f'Successfully added {email} to the list.'}), 201
    # if result.status_code != 201:
    #     return jsonify({'error': f'Failed to add {email}.', 'status': result.status_code, 'response': result.json()}), result.status_code
    # if result2.status_code != 201:
    #     return jsonify({'error': f'Failed to add {email}.', 'status': result2.status_code, 'response': result2.json()}), result2.status_code

    if result.status_code == 201:
        return jsonify({'message': f'Successfully added {email} to the list.'}), 201
    else:
        return jsonify({'error': f'Failed to add {email}.', 'status': result.status_code, 'response': result.json()}), result.status_code
# -----------------------------------------------------------------------------------------------------


# if __name__ == '__main__':
#     app.run(port=5000, debug=True)

# Get the port from the environment variable or use 5000 as default
port = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=port)