# Database Schema Documentation

## Table: assignments
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| title | varchar(100) | NO |  | NULL |  |
| description | text | YES |  | NULL |  |
| class_id | int | NO |  | NULL |  |
| teacher_id | int | NO |  | NULL |  |
| due_date | datetime | YES |  | NULL |  |
| max_score | int | YES |  | 100 |  |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: authtoken_token
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| key | varchar(40) | NO | PRI | NULL |  |
| created | datetime(6) | NO |  | NULL |  |
| user_id | int | NO | UNI | NULL |  |


## Table: auth_group
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(150) | NO | UNI | NULL |  |


## Table: auth_group_permissions
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint | NO | PRI | NULL | auto_increment |
| group_id | int | NO | MUL | NULL |  |
| permission_id | int | NO | MUL | NULL |  |


## Table: auth_permission
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(255) | NO |  | NULL |  |
| content_type_id | int | NO | MUL | NULL |  |
| codename | varchar(100) | NO |  | NULL |  |


## Table: auth_user
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| password | varchar(128) | NO |  | NULL |  |
| last_login | datetime(6) | YES |  | NULL |  |
| is_superuser | tinyint(1) | NO |  | NULL |  |
| username | varchar(150) | NO | UNI | NULL |  |
| first_name | varchar(150) | NO |  | NULL |  |
| last_name | varchar(150) | NO |  | NULL |  |
| email | varchar(254) | NO |  | NULL |  |
| is_staff | tinyint(1) | NO |  | NULL |  |
| is_active | tinyint(1) | NO |  | NULL |  |
| date_joined | datetime(6) | NO |  | NULL |  |


## Table: auth_user_groups
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint | NO | PRI | NULL | auto_increment |
| user_id | int | NO | MUL | NULL |  |
| group_id | int | NO | MUL | NULL |  |


## Table: auth_user_user_permissions
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint | NO | PRI | NULL | auto_increment |
| user_id | int | NO | MUL | NULL |  |
| permission_id | int | NO | MUL | NULL |  |


## Table: chat_rooms
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| class_id | int | YES | MUL | NULL |  |
| name | varchar(255) | YES |  | NULL |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: classes
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| class_name | varchar(255) | NO |  | NULL |  |
| class_code | varchar(20) | NO | UNI | NULL |  |
| teacher_id | int | YES | MUL | NULL |  |
| description | text | YES |  | NULL |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: classrooms
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(100) | NO |  | NULL |  |
| description | varchar(255) | YES |  | NULL |  |
| teacher_id | int | NO | MUL | NULL |  |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: class_students
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| class_id | int | NO | MUL | NULL |  |
| student_id | int | NO | MUL | NULL |  |
| joined_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: django_admin_log
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| action_time | datetime(6) | NO |  | NULL |  |
| object_id | longtext | YES |  | NULL |  |
| object_repr | varchar(200) | NO |  | NULL |  |
| action_flag | smallint unsigned | NO |  | NULL |  |
| change_message | longtext | NO |  | NULL |  |
| content_type_id | int | YES | MUL | NULL |  |
| user_id | int | NO | MUL | NULL |  |


## Table: django_content_type
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| app_label | varchar(100) | NO | MUL | NULL |  |
| model | varchar(100) | NO |  | NULL |  |


## Table: django_migrations
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint | NO | PRI | NULL | auto_increment |
| app | varchar(255) | NO |  | NULL |  |
| name | varchar(255) | NO |  | NULL |  |
| applied | datetime(6) | NO |  | NULL |  |


## Table: django_session
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| session_key | varchar(40) | NO | PRI | NULL |  |
| session_data | longtext | NO |  | NULL |  |
| expire_date | datetime(6) | NO | MUL | NULL |  |


## Table: external_sources
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| title | varchar(200) | NO |  | NULL |  |
| file_path | varchar(500) | NO |  | NULL |  |
| extracted_text | text | YES |  | NULL |  |
| uploaded_by | int | YES | MUL | NULL |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: messages
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| sender_id | int | NO | MUL | NULL |  |
| receiver_id | int | YES | MUL | NULL |  |
| class_id | int | YES | MUL | NULL |  |
| content | text | YES |  | NULL |  |
| file_path | varchar(255) | YES |  | NULL |  |
| file_name | varchar(255) | YES |  | NULL |  |
| message_type | enum('text','file','announcement') | YES |  | text |  |
| is_read | tinyint(1) | YES |  | 0 |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: plagiarism_matches
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| submission_id | int | NO | MUL | NULL |  |
| matched_submission_id | int | YES | MUL | NULL |  |
| matched_source_type | enum('submission','external') | NO |  | NULL |  |
| matched_external_url | varchar(500) | YES |  | NULL |  |
| similarity_percentage | decimal(5,2) | NO |  | NULL |  |
| matched_text | text | YES |  | NULL |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: submissions
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| assignment_id | int | NO | MUL | NULL |  |
| student_id | int | NO | MUL | NULL |  |
| file_path | varchar(500) | YES |  | NULL |  |
| file_name | varchar(500) | YES |  | NULL |  |
| file_type | varchar(255) | YES |  | NULL |  |
| file_size | int | YES |  | NULL |  |
| extracted_text | text | YES |  | NULL |  |
| similarity_score | float | YES |  | 0 |  |
| plagiarism_score | decimal(5,2) | YES |  | NULL |  |
| originality_score | decimal(5,2) | YES |  | NULL |  |
| score | decimal(5,2) | YES |  | NULL |  |
| message | varchar(255) | YES |  | NULL |  |
| submitted_at | datetime | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| checked_at | timestamp | YES |  | NULL |  |
| status | enum('pending','checked','rejected','approved','accepted') | YES |  | pending |  |
| rejection_reason | text | YES |  | NULL |  |
| shingle_score | decimal(5,2) | YES |  | NULL |  |
| cosine_score | decimal(5,2) | YES |  | NULL |  |
| semantic_score | decimal(5,2) | YES |  | NULL |  |
| hybrid_score | decimal(5,2) | YES |  | NULL |  |
| ai_score | decimal(5,2) | YES |  | 0.00 |  |
| sentence_analysis | longtext | YES |  | NULL |  |


## Table: submission_extensions
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| assignment_id | int | NO | MUL | NULL |  |
| student_id | int | NO | MUL | NULL |  |
| granted_by | int | NO | MUL | NULL |  |
| extended_until | datetime | NO |  | NULL |  |
| reason | varchar(255) | YES |  | NULL |  |
| granted_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |


## Table: users
| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int | NO | PRI | NULL | auto_increment |
| username | varchar(50) | NO | UNI | NULL |  |
| email | varchar(100) | NO | UNI | NULL |  |
| roll_number | varchar(20) | YES | UNI | NULL |  |
| hashed_password | varchar(255) | NO |  | NULL |  |
| role | varchar(20) | NO |  | NULL |  |
| is_active | tinyint(1) | YES |  | 1 |  |
| is_approved | tinyint(1) | YES |  | 0 |  |
| full_name | varchar(100) | NO |  | NULL |  |
| status | enum('pending','approved','rejected') | YES |  | pending |  |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| updated_at | timestamp | YES |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| profile_picture | varchar(255) | YES |  | NULL |  |
| reset_otp | varchar(10) | YES |  | NULL |  |
| reset_otp_expires | datetime | YES |  | NULL |  |



