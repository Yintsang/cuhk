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
            {{-- @row([
                'type' => 'textinput',
                'has_language' => true,
                'title' => 'Title Internal',
                'field' => 'title_internal',
            ]) --}}

            @row([
                'type' => 'textinput',
                'has_language' => true,
                'title' => 'Title 1',
                'field' => 'title_1',
            ])

            @row([
                'type' => 'textinput',
                'has_language' => true,
                'title' => 'Title 2',
                'field' => 'title_2',
            ])

            @row([
                'type' => 'textinput',
                'has_language' => true,
                'title' => 'Sub title',
                'field' => 'sub_title',
            ])

            @row([
                'type' => 'textinput',
                'field' => 'url',
            ])
            @row([
                'type' => 'image-upload',
                'field' => 'image',
            ])
             
            @include('admin.base.status')
        </div>
        @include('admin.base.footer') 
    </div>
    @include('admin.base.seo')
</form>
@endsection
@section('js-before')
@parent
<script>
    mixins.push({
        data: {
            titles: {
                1: 'title1',
                2: 'title2',
                3: 'title3',
            },
            rows: [],
            radio: null,
            autocomplete: '',
        }
    })
</script>
@endsection