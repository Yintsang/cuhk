<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminMenuController extends Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public static function getMenus()
    {
        return 
        [
            [
                'name' => 'Home Page',
                'sections' => [
                    'home_page' => 'Page Contents',
                    'home_banner' => 'Top Banners',
                ]
            ],
            [
                'name' => 'About',
                'sections' => [
                    'about' => "About",
                    'about_message' => "Co-Director's Message",
                    'about_overview' => 'Overview',
                    'about_management' => 'Management',
                    'about_faculty' => 'Faculty',
                    'about_learning' => 'Learning',
                    'about_news_event' => 'News & Events',
                    'about_contact' => 'Contact Us',
                ]
            ],
            [
                'name' => 'Curriculum',
                'sections' => [
                    'curriculum_structure' => 'Program Structure',
                    'curriculum_sequence' => 'Study Sequence',
                    'curriculum_course_year_1' => 'Study Sequence Year 1',
                    'curriculum_course_year_2' => 'Study Sequence Year 2',
                    'curriculum_course_year_3' => 'Study Sequence Year 3',
                    'curriculum_course_year_4' => 'Study Sequence Year 4',
                    'curriculum_course_year_5' => 'Study Sequence Year 5',
                ]
            ],
            [
                'name' => 'Student Enrichment',
                'sections' => [
                    'student_development' => 'Development',
                    'student_achievement' => 'Student Achievement',
                    'student_achievement_post' => 'Student Achievement Post',
                ]
            ],
            [
                'name' => 'Student Voices',
                'sections' => [
                    'student_voices' => 'Voices',
                ]
            ],
            [
                'name' => 'Career Prospetcs',
                'sections' => [
                    'career_prospetcs' => 'Career Prospetcs',
                ]
            ],
            [
                'name' => 'Admissions',
                'sections' => [
                    'admissions' => 'Admissions',
                    'admissions_programme' => 'Programme',
                    // 'admissions_tuition' => 'Tuition',
                    'admissions_faq' => 'FAQ',
                ]
            ],
            // [
            //     'name' => 'Home Page',
            //     'sections' => [
            //         'home_page' => 'Page Contents',
            //     ]
            // ],
        ];
    }
    
}
