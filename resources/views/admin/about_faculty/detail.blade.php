@extends('layouts.admin')
@section('buttons')

    @if($id && $url = $record->getDetailUrl(['preview' => true]))
    <a class="btn btn-primary" href="{{ $url }}" target="_blank">Preview</a>
    @endif

    @can('update', $record)
    <button class="btn btn-success btn-save-main-form" type="button">Save</button>
    @endcan

    @can('delete', $record)
    <button class="btn btn-danger btn-save-delete-form" type="button">Delete</button>
    @endcan

    @can('back', $record)
    <a class="btn btn-secondary" href="{{ $config['links']['detail']['back'] }}">Back</a>
    @endcan  
@endsection
@section('content')
<form id="deleteForm" action="{{ route('admin.' . $config['section'] . '.delete') }}" method="post" enctype="multipart/form-data">
    @csrf
    <input type="hidden" name="id" value="{{ $id }}">
</form>

<form id="mainForm" action="{{ route('admin.' . $config['section'] . '.save') }}" method="post" enctype="multipart/form-data">
    @csrf
    <input type="hidden" name="id" value="{{ $id }}">
    <div class="card">
        <div class="card-header">{{ $config['page_name'] }}</div>
        <div class="card-body" id="app-main">
            @row([
                'type' => 'image-upload',
                'field' => 'top_banner',
                'title' => 'Banner Image (2000 width X 667 height px)'
            ])

            @row([
                'type' => 'textinput',
                'field' => 'title_1',
                'title' => 'Title 1'
            ])  

            @row([
                'type' => 'textinput',
                'field' => 'title_2',
                'title' => 'Title 2'
            ])  

            @row([
                'type' => 'editor',
                'field' => 'first_description',
                'title' => 'First Description'
            ])

            @row([
                'type' => 'textinput',
                'field' => 'image_1',
                'title' => 'Image Title 1'
            ])  

            @row([
                'type' => 'textinput',
                'field' => 'image_2',
                'title' => 'Image Title 2'
            ])  

            @row([
                'type' => 'textinput',
                'field' => 'image_3',
                'title' => 'Image Title 3'
            ])  

            @row([
                'type' => 'image-upload',
                'field' => 'left_image',
                'title' => 'Left Image (1440 width X 840 height px)'
            ])

            @row([
                'type' => 'editor',
                'field' => 'url_title_1',
                'title' => ' Left URL Title'
            ])  

            @row([
                'type' => 'textinput',
                'field' => 'url_1',
                'title' => ' Left URL'
            ])  

<b>If the link is a internal page, e.g. about-programme-overview (do not contain "/" at the front) <br>

    If the link is a internal file, e.g. /storage/media/Admissions/brochure.pdf (Please contain "/" at the front)</b><br>

    <b>If it is an external website link, please include https:// at the beginning, for example, https://www.cuhk.edu.hk</b><br>

            @row([
                'type' => 'image-upload',
                'field' => 'right_image',
                'title' => 'Right Image (1140 width X 840 height px)'
            ])

            @row([
                'type' => 'editor',
                'field' => 'url_title_2',
                'title' => ' Right URL Title'
            ])  

            @row([
                'type' => 'textinput',
                'field' => 'url_2',
                'title' => ' Right URL'
            ])  
            
<b>If the link is a internal page, e.g. about-programme-overview (do not contain "/" at the front) <br>

    If the link is a internal file, e.g. /storage/media/Admissions/brochure.pdf (Please contain "/" at the front)</b><br>
    
    <b>If it is an external website link, please include https:// at the beginning, for example, https://www.cuhk.edu.hk</b><br>
        </div>
        @include('admin.base.footer') 
    </div>
    @include('admin.base.seo')
</form>
@endsection
@section('js')
@endsection