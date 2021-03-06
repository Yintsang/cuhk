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
                'type' => 'textinput',
                'field' => 'title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_header',
                'title' => 'Year Header Title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_1_top_unit',
                'title' => 'Year 1-3 Top Course Unit',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_1_top_title',
                'title' => 'Year 1-3 Top Course',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_1_bottom_unit',
                'title' => 'Year 1-3 Bottom Course Unit',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_1_bottom',
                'title' => 'Year 1-3 Bottom Course',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_4_top_unit',
                'title' => 'Year 4 Top Course Unit',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_4_top_title',
                'title' => 'Year 4 Top Course',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_4_bottom_unit',
                'title' => 'Year 4 Bottom Course Unit',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_4_bottom',
                'title' => 'Year 4 Bottom Course',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_5_top_unit',
                'title' => 'Year 5 Top Course Unit',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_5_top_title',
                'title' => 'Year 5 Top Course',
            ])

            @row([
                'type' => 'editor',
                'field' => 'course_description',
                'title' => 'Course Description',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_1',
                'title' => 'Year 1 Course Title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_2',
                'title' => 'Year 2 Course Title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_3',
                'title' => 'Year 3 Course Title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_4',
                'title' => 'Year 4 Course Title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'year_5',
                'title' => 'Year 5 Course Title',
            ])

            @row([
                'type' => 'editor',
                'field' => 'notes',
                'title' => 'Notes',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'course_list',
                'title' => 'Course List Title',
            ])

            @row([
                'type' => 'editor',
                'field' => 'course_list_description',
                'title' => 'Course List Description',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'url',
                'title' => 'URL',
            ])
             
        </div>
        @include('admin.base.footer') 
    </div>
    @include('admin.base.seo')
</form>
@endsection
@section('js')
@endsection