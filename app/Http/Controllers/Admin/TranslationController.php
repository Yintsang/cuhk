<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

class TranslationController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function listing()
    {
        parent::listing();
        $data['config'] = $this->getConfig();
        $data['records'] = $this->getPosts();
        return view($this->section('listing'), $data);
    }
    
    public function postsQuery($route_params, $query){
        if($q = request('q')){
            $like_q = '%' . $q . '%';

            $query->whereHas('descriptions', function($query) use ($like_q){
                $query->where('description', 'like', $like_q);
            })->orWhere('string_key', 'like', $like_q);
        }
        return $query;
    }

    public function detail($id = '')
    {
        parent::detail($id);
        $data['record'] = $this->getPost($id);
        $data['config'] = $this->getConfig();
        $data['languages'] = $this->getLanguages();
        $data['medias'] = $data['record']->getMedias();
        $data['id'] = $id;
        return view($this->section('detail'), $data);
    }

    public function arrangement($id = '')
    {
        $data['config'] = $this->getConfig();
        $data['records'] = $this->getAllPosts();
        return view($this->section('arrangement'), $data);
    }

    public function beforeSave(Request $request, $customData = []){
        if(empty($request->input('string_key'))){
            $customData['string_key'] = $request->input('languages')[1]['description'];
            $customData['string_key'] = preg_replace("/(&zwj;|&nbsp;|&rsquo;|&ldquo;)/", " ", $customData['string_key']);
            $customData['string_key'] = preg_replace("/<br\s?\/?>/", " ", $customData['string_key']);
            $customData['string_key'] = trim(strip_tags($customData['string_key']));
            $customData['string_key'] = preg_replace('/[^A-Za-z0-9\-\s]/', '',  $customData['string_key']);
            $customData['string_key'] = preg_replace('!\s+!', ' ', $customData['string_key']);
        }

        return $customData;
    }

    public function afterSave(Request $request, $customData = [], $model){

    }

    public function afterDelete(Request $request, $model){

    }

}
