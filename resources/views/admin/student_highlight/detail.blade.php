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
                'field' => 'image',
                'title' => 'image (500 width X 533 height px)',
            ])

            @row([
                'type' => 'editor',
                'field' => 'description',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'title',
                'title' => 'Name'
            ])

            {{-- @row([
                'type' => 'textinput',
                'field' => 'course',
                'title' => 'Course'
            ]) --}}

            @row([
                'type' => 'editor',
                'field' => 'post',
                'title' => 'Post'
            ])

            @row([
                'type' => 'radio',
                'field' => 'show_highlight',
                'title' => 'Show In Highlight',
                'options' => [
                    'default' => 0,
                    'value_key' => 'value',
                    'title_key' => 'title',
                    'list' => [
                        [
                            'title' => 'Yes',
                            'value' => 1,
                        ],
                        [
                            'title' => 'No',
                            'value' => 0,
                        ],
                    ]
                ]
            ])
             
        </div>
        @include('admin.base.footer') 
    </div>
    @include('admin.base.seo')
</form>
@endsection
@section('js')
@endsection